export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: number
          name: string
          created_at: string
        }
      }
      slides: {
        Row: {
          id: number
          topic_id: number
          title: string
          image_url: string | null
          created_at: string
        }
      }
      bullet_points: {
        Row: {
          id: number
          slide_id: number
          content: string
          order_index: number
        }
      }
    }
  }
}

export type Topic = Database['public']['Tables']['topics']['Row'] & {
  slides: Slide[]
}

export type Slide = Database['public']['Tables']['slides']['Row'] & {
  bullet_points: BulletPoint[]
}

export type BulletPoint = Database['public']['Tables']['bullet_points']['Row']