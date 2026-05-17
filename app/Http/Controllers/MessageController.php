<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // get conversation between auth user and another user
    public function index(Request $request, $userId)
    {
        $authId = $request->user()->id;

        $messages = Message::with('sender')
            ->where(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $authId)->where('receiver_id', $userId);
            })
            ->orWhere(function ($q) use ($authId, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $authId);
            })
            ->oldest()
            ->get();

        // mark received messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $authId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    // get list of conversations (latest message per user)
    public function conversations(Request $request)
    {
        $authId = $request->user()->id;

        $messages = Message::with(['sender', 'receiver'])  // ← both required
            ->where('sender_id', $authId)
            ->orWhere('receiver_id', $authId)
            ->latest()
            ->get()
            ->groupBy(function ($msg) use ($authId) {
                return $msg->sender_id === $authId
                    ? $msg->receiver_id
                    : $msg->sender_id;
            })
            ->map(fn($msgs) => $msgs->first())
            ->values();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'body' => $request->body,
        ]);

        $message->load('sender');

        // broadcast to the private channel
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }
}