import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

import { useAuthStore } from "../store/useAuthStore"

export const useChatStore = create((set, get) => ({

    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {

        set({ isUsersLoading: true })

        try {

            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data })

        } catch (error) {

            toast.error(error.response.message)

        }

        finally {

            set({ isUsersLoading: false })

        }

    },

    getMessages: async (userId) => {

        set({ isMessagesLoading: true })

        try {

            const res = await axiosInstance.get(`/messages/${userId}`)

            set({ messages: res.data })

        } catch (error) {

            toast.error(error.response.data.message);

        } finally {

            set({ isMessagesLoading: false })

        }

    },

    sendMessage: async (data) => {

        const { selectedUser, messages } = get();

        try {

            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, data)
            set({ messages: [...messages, res.data] })

        } catch (error) {

            toast.error(error.response.data.message);

        }

    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        const messageListener = (newMessage) => {
            const { selectedUser, messages } = get();

            const isRelevant =
                selectedUser &&
                (newMessage.senderId === selectedUser._id ||
                    newMessage.receiverId === selectedUser._id);

            if (isRelevant) {
                set({ messages: [...messages, newMessage] });
            } else {
                toast.success("New message received");
            }
        };

        socket.on("getMessage", messageListener);

        set({ messageListener });
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        const { messageListener } = get();
        if (messageListener) {
            socket.off("getMessage", messageListener);
            set({ messageListener: null });
        }
    },


    //todo: optimize this one later
    setSelectedUser: (SelectedUser) => set({ selectedUser: SelectedUser }),

}))