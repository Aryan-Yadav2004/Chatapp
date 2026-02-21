import { ChatLayout } from "@/components/chat/ChatLayout";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      {/* Unauthenticated View */}
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
          <main className="flex flex-col items-center gap-8 rounded-2xl bg-white p-12 text-center shadow-xl dark:bg-zinc-900 sm:p-16 border border-zinc-100 dark:border-zinc-800">
            <div className="bg-blue-100 p-4 rounded-full dark:bg-blue-900/30 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              Welcome to Livechat
            </h1>
            <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
              Connect with others in real-time. Sign in to start chatting with friends and colleagues.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <SignInButton mode="modal">
                <button className="flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-blue-600 px-8 font-medium text-white transition-colors hover:bg-blue-700 shadow-md">
                  Sign In to Chat
                </button>
              </SignInButton>
            </div>
          </main>
        </div>
      </SignedOut>

      {/* Authenticated View */}
      <SignedIn>
        <ChatLayout />
      </SignedIn>
    </>
  );
}
