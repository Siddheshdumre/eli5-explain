import { useEffect, useState } from "react"
import { MessageSquare, Plus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
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

export function AppSidebar({ currentThreadId }: { currentThreadId?: string }) {
    const [threads, setThreads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        loadThreads()
    }, [currentThreadId]) // Reload threads when URL changes (thread creation)

    const loadThreads = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/threads', {
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

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 shadow-sm"
                    onClick={() => {
                        navigate('/app')
                    }}
                >
                    <Plus className="h-4 w-4" />
                    New Conversation
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">History</SidebarGroupLabel>
                    <SidebarGroupContent>
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : threads.length === 0 ? (
                            <div className="text-center p-4 text-sm text-muted-foreground">
                                No history yet. Start asking!
                            </div>
                        ) : (
                            <SidebarMenu>
                                {threads.map((thread) => (
                                    <SidebarMenuItem key={thread.id}>
                                        <SidebarMenuButton
                                            isActive={thread.id === currentThreadId}
                                            onClick={() => navigate(`/app/${thread.id}`)}
                                            tooltip={thread.title}
                                        >
                                            <MessageSquare className="h-4 w-4 min-w-4 text-muted-foreground" />
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
