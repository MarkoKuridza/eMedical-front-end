import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = 'http://localhost:9000/ws';

export function useWebSocket(topics = [], onMessage) {
    const [connected, setConnected] = useState(false);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    });

    const topicsKey = topics.join(",");

    useEffect(() => {
        if (!topicsKey) return;
        const socket = new SockJS(WS_URL, null, { withCredentials: true });

        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000
        });

        client.onConnect = () => {
            setConnected(true);
            topics.forEach((topic) => {
                client.subscribe(topic, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        onMessageRef.current?.(data);
                    } catch (e) {
                        console.error("WebSocket error while parse message", e);
                    }
                });
            });
        };

        client.onDisconnect = () => setConnected(false);
        client.onStompError = (frame) =>
            console.error("WebSocket STOMP error", frame.headers["message"]);

        client.activate();
        return () => client.deactivate();

    }, [topicsKey])

    return { connected };

};