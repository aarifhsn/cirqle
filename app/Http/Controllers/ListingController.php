<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index()
    {
        return response()->json(
            Listing::where('status', 'active')
                ->latest()
                ->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'images.*' => 'nullable|image|max:5048', // validate each file
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'nullable|in:active,sold',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('listings', 'public');
            }
        }

        $listing = Listing::create([
            ...$data,
            'images' => $imagePaths,  // stored as JSON array of paths
            'status' => $data['status'] ?? 'active',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($listing->load('user'), 201);
    }
}