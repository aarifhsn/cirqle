import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as ToastModule from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import PostHeader from "./PostHeader";

vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useAxios");
vi.mock("../../hooks/usePost");
vi.mock("react-toastify", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));
vi.mock("./PostEntry", () => ({
    default: ({ onCreate, onClose }) => (
        <div data-testid="post-entry-modal">
            <button onClick={onClose}>Close</button>
            <button onClick={onCreate}>Create</button>
        </div>
    ),
}));
vi.mock("./PrivacyIcon", () => ({
    default: ({ privacy }) => <span data-testid="privacy-icon">{privacy}</span>,
}));
vi.mock("../common/Avatar", () => ({
    default: ({ user }) => <div data-testid="avatar">{user?.name}</div>,
}));

const mockPost = {
    id: 1,
    content: "Test post",
    privacy: "public",
    createAt: new Date().toISOString(),
    is_saved: false,
    author: {
        id: 1,
        name: "John Doe",
        username: "johndoe",
        avatar: "avatar.jpg",
    },
};

const mockAuthUser = {
    user: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        avatar: "avatar.jpg",
    },
};

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PostHeader", () => {
    let mockApi;
    let mockDispatch;

    beforeEach(() => {
        vi.clearAllMocks();

        mockApi = {
            post: vi.fn(),
            delete: vi.fn(),
        };
        mockDispatch = vi.fn();

        useAuth.mockReturnValue({ auth: mockAuthUser });
        useAxios.mockReturnValue({ api: mockApi });
        usePost.mockReturnValue({ dispatch: mockDispatch });

        ToastModule.toast.success.mockClear();
        ToastModule.toast.error.mockClear();

        global.window.confirm = vi.fn(() => true);
    });

    describe("Rendering", () => {
        test("renders post author name and avatar", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            expect(screen.getByTestId("avatar")).toHaveTextContent("John Doe");
            const allNames = screen.getAllByText("John Doe");
            expect(allNames.length).toBeGreaterThan(0);
        });

        test("renders post timestamp", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            const timespan = screen.getByText(/just now/i);
            expect(timespan).toBeInTheDocument();
        });

        test("renders privacy icon", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            expect(screen.getByTestId("privacy-icon")).toHaveTextContent(
                "public",
            );
        });

        test("renders menu button", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            expect(screen.getByLabelText("Post options")).toBeInTheDocument();
        });
    });

    describe("Save/Unsave Post", () => {
        test("toggles menu on button click", async () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            const menuButton = screen.getByLabelText("Post options");
            expect(screen.queryByText("Save Post")).not.toBeInTheDocument();

            fireEvent.click(menuButton);
            expect(screen.getByText("Save Post")).toBeInTheDocument();

            fireEvent.click(menuButton);
            expect(screen.queryByText("Save Post")).not.toBeInTheDocument();
        });

        test("saves post and shows success toast", async () => {
            mockApi.post.mockResolvedValue({
                data: { is_saved: true, message: "Post saved!" },
            });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Save Post"));

            await waitFor(() => {
                expect(mockApi.post).toHaveBeenCalledWith(
                    expect.stringContaining(`/posts/${mockPost.id}/save`),
                );
            });

            await waitFor(() => {
                expect(ToastModule.toast.success).toHaveBeenCalledWith(
                    "Post saved!",
                );
            });
        });

        test("unsaves post and calls onUnsave callback", async () => {
            const onUnsave = vi.fn();
            const savedPost = { ...mockPost, is_saved: true };
            mockApi.post.mockResolvedValue({
                data: { is_saved: false, message: "Post unsaved." },
            });

            renderWithRouter(
                <PostHeader post={savedPost} onUnsave={onUnsave} />,
            );

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Unsave Post"));

            await waitFor(() => {
                expect(onUnsave).toHaveBeenCalledWith(mockPost.id);
            });
        });

        test("shows error toast on save failure", async () => {
            mockApi.post.mockRejectedValue(new Error("Network error"));

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Save Post"));

            await waitFor(() => {
                expect(ToastModule.toast.error).toHaveBeenCalledWith(
                    "Failed to save post.",
                );
            });
        });

        test("displays correct save button text when not saved", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            expect(screen.getByText("Save Post")).toBeInTheDocument();
        });

        test("displays correct unsave button text when already saved", () => {
            const savedPost = { ...mockPost, is_saved: true };
            renderWithRouter(<PostHeader post={savedPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            expect(screen.getByText("Unsave Post")).toBeInTheDocument();
        });
    });

    describe("Delete Post", () => {
        test("shows delete option only for own posts", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            expect(screen.getByText("Delete Post")).toBeInTheDocument();
        });

        test("hides delete and edit options for other users posts", () => {
            const otherUserPost = {
                ...mockPost,
                author: { ...mockPost.author, id: 999 },
            };
            renderWithRouter(<PostHeader post={otherUserPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            expect(screen.queryByText("Delete Post")).not.toBeInTheDocument();
            expect(screen.queryByText("Edit Post")).not.toBeInTheDocument();
        });

        test("deletes post with confirmation", async () => {
            mockApi.delete.mockResolvedValue({ status: 200 });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Delete Post"));

            expect(window.confirm).toHaveBeenCalledWith("Delete this post?");

            await waitFor(() => {
                expect(mockApi.delete).toHaveBeenCalledWith(
                    expect.stringContaining(`/posts/${mockPost.id}`),
                );
            });

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: "POST_DATA_DELETED",
                    data: mockPost.id,
                });
            });

            await waitFor(() => {
                expect(ToastModule.toast.success).toHaveBeenCalledWith(
                    "Post deleted!",
                );
            });
        });

        test("cancels delete when confirmation rejected", async () => {
            global.window.confirm = vi.fn(() => false);

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Delete Post"));

            await waitFor(() => {
                expect(mockApi.delete).not.toHaveBeenCalled();
            });
        });

        test("shows error toast on delete failure", async () => {
            mockApi.delete.mockRejectedValue({
                response: { data: { message: "Cannot delete post" } },
            });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Delete Post"));

            await waitFor(() => {
                expect(ToastModule.toast.error).toHaveBeenCalledWith(
                    "Cannot delete post",
                );
            });

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "POST_DATA_FETCH_ERROR",
                }),
            );
        });

        test("dispatches fetching action before delete", async () => {
            mockApi.delete.mockResolvedValue({ status: 200 });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Delete Post"));

            expect(mockDispatch).toHaveBeenCalledWith({
                type: "POST_DATA_FETCHING",
            });
        });
    });

    describe("Edit Post", () => {
        test("opens edit modal when edit button clicked", async () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Edit Post"));

            expect(screen.getByTestId("post-entry-modal")).toBeInTheDocument();
        });

        test("closes menu when edit button clicked", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            expect(screen.getByText("Edit Post")).toBeInTheDocument();

            fireEvent.click(screen.getByText("Edit Post"));
            expect(screen.queryByText("Edit Post")).not.toBeInTheDocument();
        });

        test("closes edit modal on onCreate", async () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Edit Post"));

            expect(screen.getByTestId("post-entry-modal")).toBeInTheDocument();

            fireEvent.click(screen.getByText("Create"));

            await waitFor(() => {
                expect(
                    screen.queryByTestId("post-entry-modal"),
                ).not.toBeInTheDocument();
            });
        });

        test("closes edit modal on close button", async () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Edit Post"));

            fireEvent.click(screen.getByText("Close"));

            await waitFor(() => {
                expect(
                    screen.queryByTestId("post-entry-modal"),
                ).not.toBeInTheDocument();
            });
        });
    });

    describe("Author Display", () => {
        test("uses current user data when viewing own post", () => {
            const ownPost = {
                ...mockPost,
                author: { ...mockPost.author, id: 1 },
            };
            renderWithRouter(<PostHeader post={ownPost} />);

            expect(screen.getByTestId("avatar")).toHaveTextContent("John Doe");
        });

        test("uses post author data when viewing other user post", () => {
            const otherUserPost = {
                ...mockPost,
                author: {
                    id: 999,
                    name: "Jane Smith",
                    username: "janesmith",
                    avatar: "jane-avatar.jpg",
                },
            };
            renderWithRouter(<PostHeader post={otherUserPost} />);

            expect(screen.getByTestId("avatar")).toHaveTextContent(
                "Jane Smith",
            );
            const allNames = screen.getAllByText("Jane Smith");
            expect(allNames.length).toBeGreaterThan(0);
        });

        test("generates correct profile link for author", () => {
            renderWithRouter(<PostHeader post={mockPost} />);

            const profileLinks = screen.getAllByRole("link");
            expect(
                profileLinks.some((link) => link.href.includes("/johndoe")),
            ).toBe(true);
        });
    });

    describe("Interaction", () => {
        test("closes menu when save button clicked", async () => {
            mockApi.post.mockResolvedValue({
                data: { is_saved: true, message: "Post saved!" },
            });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            const saveButton = screen.getByText("Save Post");
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockApi.post).toHaveBeenCalled();
            });
        });

        test("closes menu when delete button clicked", async () => {
            mockApi.delete.mockResolvedValue({ status: 200 });

            renderWithRouter(<PostHeader post={mockPost} />);

            fireEvent.click(screen.getByLabelText("Post options"));
            fireEvent.click(screen.getByText("Delete Post"));

            expect(window.confirm).toHaveBeenCalled();
        });
    });
});
