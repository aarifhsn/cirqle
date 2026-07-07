<?php

use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{id1}.{id2}', function ($user, $id1, $id2) {
    // user must be one of the two participants
    return (int) $user->id === (int) $id1 || (int) $user->id === (int) $id2;
});

