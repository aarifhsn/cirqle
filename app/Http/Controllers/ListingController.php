<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ListingController extends Controller
{
    public function index()
    {
        $paginated = Listing::where('status', 'active')
            ->with('user')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => collect($paginated->items())->map(fn($l) => $this->formatListing($l)),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }

    public function show($id)
    {
        $listing = Listing::with('user')->findOrFail($id);
        return response()->json($listing);
    }

    public function store(Request $request)
    {
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

        unset($data['images']);

        $listing = Listing::create([
            ...$data,
            'images' => $imagePaths,  // stored as JSON array of paths
            'status' => $data['status'] ?? 'active',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($listing->load('user'), 201);
    }

    private function formatListing($listing): array
    {
        return [
            'id' => $listing->id,
            'title' => $listing->title,
            'description' => $listing->description,
            'price' => $listing->price,
            'category' => $listing->category,
            'images' => $listing->images,
            'location' => $listing->location,
            'status' => $listing->status,
            'created_at' => $listing->created_at,
            'user' => [
                'id' => $listing->user->id,
                'firstName' => $listing->user->firstName,
                'lastName' => $listing->user->lastName,
                'username' => $listing->user->username,
                'avatar' => $listing->user->avatar,
            ],
        ];
    }
}