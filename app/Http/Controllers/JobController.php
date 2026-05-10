<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index()
    {
        return response()->json(
            Job::latest()->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string',
            'type' => 'required|in:full-time,part-time,remote',
            'salary' => 'nullable|string',
        ]);

        $data['user_id'] = $request->user()->id;

        return response()->json(
            Job::create($data),
            201
        );
    }
}