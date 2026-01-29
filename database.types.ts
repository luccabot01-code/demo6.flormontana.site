export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            wedding_template_couples: {
                Row: {
                    couple_name: string
                    created_at: string | null
                    event_date: string | null
                    id: string
                    location: string | null
                    slug: string
                    theme_id: string | null
                }
                Insert: {
                    couple_name: string
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    location?: string | null
                    slug: string
                    theme_id?: string | null
                }
                Update: {
                    couple_name?: string
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    location?: string | null
                    slug?: string
                    theme_id?: string | null
                }
                Relationships: []
            }
            wedding_template_rsvps: {
                Row: {
                    attending: boolean | null
                    couple_id: string | null
                    created_at: string | null
                    dietary_restrictions: string | null
                    guest_name: string
                    id: string
                    party_size: number | null
                }
                Insert: {
                    attending?: boolean | null
                    couple_id?: string | null
                    created_at?: string | null
                    dietary_restrictions?: string | null
                    guest_name: string
                    id?: string
                    party_size?: number | null
                }
                Update: {
                    attending?: boolean | null
                    couple_id?: string | null
                    created_at?: string | null
                    dietary_restrictions?: string | null
                    guest_name?: string
                    id?: string
                    party_size?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "wedding_template_rsvps_couple_id_fkey"
                        columns: ["couple_id"]
                        isOneToOne: false
                        referencedRelation: "wedding_template_couples"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
