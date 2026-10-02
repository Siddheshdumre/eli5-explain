/** Brief full-screen wait while the session loads: a plain status line, no spinner theatre. */
export const LoadingScreen = ({ message = "Loading…" }: { message?: string }) => {
    return (
        <div role="status" aria-live="polite" className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <p className="t-small font-medium text-foreground/75">{message}</p>
        </div>
    );
};

export default LoadingScreen;
