import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile Form State
    const [displayName, setDisplayName] = useState("");
    const [profession, setProfession] = useState("");
    const [interests, setInterests] = useState("");

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                navigate('/login');
            } else {
                loadProfile(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) navigate('/login');
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore row not found error
                throw error;
            }

            if (data) {
                setDisplayName(data.display_name || "");
                setProfession(data.profession || "");
                setInterests(data.interests || "");
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setSaving(true);
        try {
            const profileData = {
                user_id: session.user.id,
                display_name: displayName,
                profession: profession,
                interests: interests,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert(profileData);

            if (error) throw error;

            toast({
                title: "Profile saved!",
                description: "Your information has been successfully updated.",
            });
        } catch (error) {
            toast({
                title: "Error saving profile",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Auth Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                        <LogOut className="h-4 w-4 mr-2 hidden md:block" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-2xl py-8 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Profile Settings</CardTitle>
                        <CardDescription>
                            Manage your public display name and learning preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={saveProfile} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={session?.user?.email}
                                    disabled
                                    className="bg-muted/50 w-full md:w-2/3"
                                />
                                <p className="text-xs text-muted-foreground">Your login email cannot be changed here.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    placeholder="How should we call you?"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full md:w-2/3"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profession">Profession or Major</Label>
                                <Input
                                    id="profession"
                                    placeholder="e.g. Software Engineer, Biology Student"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                    className="w-full md:w-2/3"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interests">Interests & Hobbies</Label>
                                <Textarea
                                    id="interests"
                                    placeholder="e.g. Baking, European History, Video Games. We can use these to create fun analogies!"
                                    value={interests}
                                    onChange={(e) => setInterests(e.target.value)}
                                    className="w-full h-24 resize-none"
                                />
                            </div>

                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
