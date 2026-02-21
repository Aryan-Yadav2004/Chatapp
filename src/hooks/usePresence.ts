import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function usePresence() {
    const { isAuthenticated } = useConvexAuth();
    const heartbeat = useMutation(api.presence.heartbeat);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Send an initial heartbeat immediately
        const sendHeartbeat = async () => {
            try {
                await heartbeat();
            } catch (error) {
                console.error("Failed to send heartbeat:", error);
            }
        };
        sendHeartbeat();

        // Then send a heartbeat every 15 seconds
        const intervalId = setInterval(sendHeartbeat, 15000);

        return () => clearInterval(intervalId);
    }, [isAuthenticated, heartbeat]);
}
