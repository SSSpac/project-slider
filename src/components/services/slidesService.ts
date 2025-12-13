import { supabase } from '../../../supabase'
import { Topic, Slide } from '../../app/types/database'

export const slidesService = {
  _ensureClient() {
    if (!supabase) {
      throw new Error('Supabase client is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
    }
    return supabase
  },
  async fetchTopicsWithSlides(): Promise<Topic[]> {
    try {
      const client = this._ensureClient()
      const { data: topics, error } = await client
        .from('topics')
        .select(`
          *,
          slides (
            *,
            bullet_points (
              *
            )
          )
        `)
        .order('id', { ascending: true })

      if (error) {
        console.error('Supabase fetch error:', error)
        throw error
      }

      return topics || []
    } catch (error) {
      console.error('Error fetching topics with slides:', error)
      return []
    }
  },

  async addTopic(name: string): Promise<Topic | null> {
    try {
      const client = this._ensureClient()
      const { data, error } = await client
        .from('topics')
        .insert([{ name }])
        .select()
        .single()

      if (error) {
        console.error('Supabase addTopic error:', error)
        throw error
      }

      return { ...data, slides: [] }
    } catch (error) {
      console.error('Error adding topic:', error)
      return null
    }
  },

  async addSlide(
    topicId: number,
    title: string,
    imageUrl?: string,
    bullets?: string[]
  ): Promise<Slide | null> {
    try {
      console.log('Adding slide with:', { topicId, title, imageUrl, bullets })

      const client = this._ensureClient()
      const { data: slide, error: slideError } = await client
        .from('slides')
        .insert([
          {
            topic_id: topicId,
            title: title,
            image_url: imageUrl || null
          }
        ])
        .select()
        .single()

      if (slideError) {
        console.error('Supabase slide insert error:', slideError)
        throw slideError
      }

      console.log('Slide inserted:', slide)

      if (bullets && bullets.length > 0) {
        const bulletPointsData = bullets
          .filter(bullet => bullet.trim() !== '') 
          .map((content, index) => ({
            slide_id: slide.id,
            content: content.trim(),
            order_index: index
          }))

        if (bulletPointsData.length > 0) {
          const { error: bulletsError } = await client
            .from('bullet_points')
            .insert(bulletPointsData)

          if (bulletsError) {
            console.error('Supabase bullet points insert error:', bulletsError)
            throw bulletsError
          }

          console.log('Bullet points inserted:', bulletPointsData.length)
        }
      }

      const { data: slideWithBullets, error: fetchError } = await client
        .from('slides')
        .select(`
          *,
          bullet_points (*)
        `)
        .eq('id', slide.id)
        .single()

      if (fetchError) {
        console.error('Supabase fetch slide error:', fetchError)

        return { ...slide, bullet_points: [] }
      }

      return slideWithBullets
    } catch (error: any) {
      console.error('Error adding slide:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}_${randomString}.${fileExt}`
      const filePath = fileName

      console.log('Uploading image:', { fileName, filePath, size: file.size })

      const client = this._ensureClient()
      const { data, error } = await client.storage
        .from('slides-images') 
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase storage upload error:', error)
        throw error
      }

      const { data: { publicUrl } } = await client.storage
        .from('slides-images')
        .getPublicUrl(filePath)

      console.log('Image uploaded successfully:', publicUrl)
      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  },

  async updateSlide(slideId: number, updates: Partial<Slide>): Promise<boolean> {
    try {
      const client = this._ensureClient()
      const { error } = await client
        .from('slides')
        .update(updates)
        .eq('id', slideId)

      if (error) {
        console.error('Supabase update slide error:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error updating slide:', error)
      return false
    }
  },

  async deleteSlide(slideId: number): Promise<boolean> {
    try {
      const client = this._ensureClient()
      const { error: bulletsError } = await client
        .from('bullet_points')
        .delete()
        .eq('slide_id', slideId)

      if (bulletsError) {
        console.error('Supabase delete bullet points error:', bulletsError)
        throw bulletsError
      }

      const { error: slideError } = await client
        .from('slides')
        .delete()
        .eq('id', slideId)

      if (slideError) {
        console.error('Supabase delete slide error:', slideError)
        throw slideError
      }

      return true
    } catch (error) {
      console.error('Error deleting slide:', error)
      return false
    }
  },

  async updateBulletPoints(slideId: number, bullets: string[]): Promise<boolean> {
    try {
      const client = this._ensureClient()
      const { error: deleteError } = await client
        .from('bullet_points')
        .delete()
        .eq('slide_id', slideId)

      if (deleteError) {
        console.error('Supabase delete bullet points error:', deleteError)
        throw deleteError
      }

      if (bullets.length > 0) {
        const bulletPointsData = bullets
          .filter(bullet => bullet.trim() !== '')
          .map((content, index) => ({
            slide_id: slideId,
            content: content.trim(),
            order_index: index
          }))

        const { error: insertError } = await client
          .from('bullet_points')
          .insert(bulletPointsData)

        if (insertError) {
          console.error('Supabase insert bullet points error:', insertError)
          throw insertError
        }
      }

      return true
    } catch (error) {
      console.error('Error updating bullet points:', error)
      return false
    }
  },

  getImageUrl(path: string): string {
    const client = this._ensureClient()
    const { data: { publicUrl } } = client.storage
      .from('slides-images')
      .getPublicUrl(path)
    return publicUrl
  },

  async testConnection(): Promise<boolean> {
    try {
      const client = this._ensureClient()
      const { data, error } = await client
        .from('topics')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Supabase connection test error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}