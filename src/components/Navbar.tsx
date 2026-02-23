"use client";

import Link from "next/link";
import { Bell, Home, MessageCircle, Menu, Search, User } from "lucide-react";
import { SignIn, SignOut } from "@/components/AuthButton";
import { useSite } from "@/components/providers/SiteProvider";

export default function Navbar() {
    const { currentUser } = useSite();

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-14">
            <div className="flex items-center justify-between px-4 h-full">
                {/* Left Side: Logo & Search */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                    </Link>
                    <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-2 w-64">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Site İçi Arama..."
                            className="bg-transparent border-none outline-none ml-2 text-sm w-full"
                        />
                    </div>
                </div>

                {/* Center: Navigation Icons */}
                <div className="hidden md:flex items-center gap-8 h-full">
                    <Link href="/" className="flex items-center justify-center w-24 h-full border-b-4 border-blue-600 text-blue-600">
                        <Home className="w-7 h-7" />
                    </Link>
                    <Link href="/directory" className="flex items-center justify-center w-24 h-full text-gray-500 hover:bg-gray-100 rounded-lg my-1 transition-colors">
                        <User className="w-7 h-7" />
                    </Link>
                </div>

                {/* Right Side: User Actions */}
                <div className="flex items-center gap-2">
                    {currentUser ? (
                        <>
                            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors hidden sm:block">
                                <Menu className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors hidden sm:block">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 ml-2">
                                <button className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden hover:opacity-90 transition-opacity">
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                </button>
                                <SignOut />
                            </div>
                        </>
                    ) : (
                        <SignIn />
                    )}
                </div>
            </div>
        </nav>
    );
}
