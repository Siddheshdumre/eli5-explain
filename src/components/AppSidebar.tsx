import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { apiUrl } from "@/lib/api"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface ChatThread {
    id: string
    title: string
    created_at: string
}

export function AppSidebar({ currentThreadId, signedIn }: { currentThreadId?: string; signedIn: boolean }) {
    const [threads, setThreads] = useState<ChatThread[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadThreads()
    }, [currentThreadId]) // Reload threads when URL changes (thread creation)

    const loadThreads = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch(apiUrl('/api/threads'), {
                headers: { Authorization: `Bearer ${session.access_token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setThreads(data.threads || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const emptyMessage = signedIn ? "No saved threads yet." : "Log in to keep your threads."

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <Button variant="outline" className="h-10 w-full justify-start t-small font-medium" onClick={() => navigate('/app')}>
                    New conversation
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 t-label font-medium text-muted-foreground">History</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {loading && signedIn ? (
                            <p role="status" className="px-2 py-2 t-label text-muted-foreground">Loading…</p>
                        ) : threads.length === 0 ? (
                            <p className="px-2 py-2 t-label text-muted-foreground">{emptyMessage}</p>
                        ) : (
                            <SidebarMenu>
                                {threads.map((thread) => (
                                    <SidebarMenuItem key={thread.id}>
                                        <SidebarMenuButton
                                            isActive={thread.id === currentThreadId}
                                            onClick={() => navigate(`/app/${thread.id}`)}
                                            tooltip={thread.title}
                                            className="h-10 t-small"
                                        >
                                            <span className="truncate">{thread.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
