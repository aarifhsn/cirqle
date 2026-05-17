<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index()
    {
        return response()->json(
            Job::with('poster')->latest()->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string',
            'type' => 'required|in:full-time,part-time,remote,internship,freelance',
            'salary' => 'nullable|string',
            'tags' => 'nullable|array',
            'category' => 'nullable|string',

        ]);

        $data['user_id'] = $request->user()->id;

        $job = Job::create($data);

        return response()->json(
            $job->load('poster'),
            201
        );
    }

    public function show(Job $job)
    {
        return response()->json(
            $job->load('poster'),
            200
        );
    }

    public function destroy(Request $request, Job $job)
    {
        if ($job->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted.']);
    }
}