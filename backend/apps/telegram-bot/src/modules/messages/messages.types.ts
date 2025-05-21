export interface MessageModel {
    id: string;
    source: string;
    from: string;
    message: string;
    created_at: Date;
    address: string;
    data?: string;
}

export type MessageCreate = Omit<MessageModel, 'id' | 'created_at'>;
