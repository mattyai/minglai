export type UserId = 'yael' | 'ahmad' | 'david' | 'user';

export type User = {
    id: UserId;
    role: string;
    name: string;
    image: string;
    voice: number;
}

export type ConversationItem = {
    from: UserId;
    to: UserId | 'everyone';
    message: string;
}
