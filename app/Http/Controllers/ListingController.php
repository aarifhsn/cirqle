<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        // 👇 add before validate
        Log::info('POST data:', $request->all());
        Log::info('FILES:', $_FILES);
        Log::info('PHP upload error codes:', array_map(
            fn($f) => $f['error'] ?? 'unknown',
            $_FILES['images'] ?? []
        ));
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'images' => 'nullable|array|max:5',
            'images.*' => 'nullable|mimes:jpeg,jpg,png,gif,webp|max:4096',
            'category' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'nullable|in:active,sold',
        ], [
            // 👇 custom messages
            'images.*.mimes' => 'Only JPEG, PNG, GIF and WebP images are allowed.',
            'images.*.max' => 'Each image must be under 10MB.',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('listings', 'public');
            }
        }

        Log::info('files:', array_map(
            fn($f) => ['name' => $f->getClientOriginalName(), 'size' => $f->getSize(), 'mime' => $f->getMimeType()],
            $request->file('images') ?? []
        ));

        unset($data['images']);

        $listing = Listing::create([
            ...$data,
            'images' => $imagePaths,  // stored as JSON array of paths
            'status' => $data['status'] ?? 'active',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($listing->load('user'), 201);
    }
}