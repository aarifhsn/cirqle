<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Disable queuing for real-time broadcasting
     */
    public $queue = null;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        // private channel between two users — sorted so both sides listen on same channel
        $ids = collect([$this->message->sender_id, $this->message->receiver_id])->sort()->values();
        return [
            new PrivateChannel("chat.{$ids[0]}.{$ids[1]}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'body' => $this->message->body,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'created_at' => $this->message->created_at,
            'sender' => [
                'id' => $this->message->sender->id,
                'firstName' => $this->message->sender->firstName,
                'lastName' => $this->message->sender->lastName,
                'avatar' => $this->message->sender->avatar,
                'username' => $this->message->sender->username,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
