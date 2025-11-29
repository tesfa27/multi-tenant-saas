export default function DashboardPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome to your tenant dashboard
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Total Projects</div>
                    <div className="mt-2 text-3xl font-bold">12</div>
                    <div className="mt-1 text-sm text-gray-500">+2 from last month</div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Team Members</div>
                    <div className="mt-2 text-3xl font-bold">8</div>
                    <div className="mt-1 text-sm text-gray-500">+1 from last month</div>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Active Tasks</div>
                    <div className="mt-2 text-3xl font-bold">24</div>
                    <div className="mt-1 text-sm text-gray-500">6 due this week</div>
                </div>
            </div>

            <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-4 border-b pb-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">New project created</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-b pb-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Team member added</p>
                            <p className="text-xs text-gray-500">5 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Task completed</p>
                            <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
