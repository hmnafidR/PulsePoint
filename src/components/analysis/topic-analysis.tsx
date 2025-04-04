export function LiveTopicAnalysis() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h3 className="font-medium">Vibe Coding</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Challenges and approaches to AI-assisted coding with unfamiliar languages.</div>
          <div className="mt-1.5 text-xs text-blue-600 dark:text-blue-400">Most discussed (16%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
            <h3 className="font-medium">Project Organization</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Tools and techniques to clean up and organize code projects.</div>
          <div className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400">Key topic (14%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <h3 className="font-medium">AI Tools for Development</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Discussion of various AI tools and resources for development.</div>
          <div className="mt-1.5 text-xs text-purple-600 dark:text-purple-400">Trending (13%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-pink-500"></div>
            <h3 className="font-medium">Debugging Tips</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Strategies for debugging and the mental approach to problem-solving.</div>
          <div className="mt-1.5 text-xs text-pink-600 dark:text-pink-400">Rising (12%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
            <h3 className="font-medium">Project Demos</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Demonstration of participants' bootcamp projects and features.</div>
          <div className="mt-1.5 text-xs text-cyan-600 dark:text-cyan-400">Discussed (11%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <h3 className="font-medium">Project Sharing</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Importance of sharing projects for feedback and community support.</div>
          <div className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">Emerging (10%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <h3 className="font-medium">Bootcamp Progress</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Updates on participants' progress in the bootcamp.</div>
          <div className="mt-1.5 text-xs text-green-600 dark:text-green-400">Discussed (9%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <h3 className="font-medium">Tool Use Implementation</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Discussion about implementing tool use with AI models and SDKs.</div>
          <div className="mt-1.5 text-xs text-red-600 dark:text-red-400">Mentioned (8%)</div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-500"></div>
            <h3 className="font-medium">Humor and Camaraderie</h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Humorous exchanges and community building among participants.</div>
          <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">Throughout (7%)</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium">Topic Evolution Over Time</h3>
        <div className="relative h-[150px]">
          <div className="absolute inset-0">
            <div className="h-full w-full">
              <svg viewBox="0 0 100 30" className="h-full w-full">
                {/* Vibe Coding */}
                <path
                  d="M0,19 C10,17 20,10 30,11 C40,12 50,8 60,10 C70,12 80,8 90,5 L90,30 L0,30 Z"
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="0.5"
                />
                {/* Project Organization */}
                <path
                  d="M0,21 C10,19 20,16 30,14 C40,12 50,11 60,13 C70,15 80,17 90,12 L90,30 L0,30 Z"
                  fill="rgba(99, 102, 241, 0.2)"
                  stroke="rgba(99, 102, 241, 0.5)"
                  strokeWidth="0.5"
                />
                {/* AI Tools */}
                <path
                  d="M0,24 C10,22 20,20 30,18 C40,16 50,15 60,16 C70,17 80,14 90,15 L90,30 L0,30 Z"
                  fill="rgba(168, 85, 247, 0.2)"
                  stroke="rgba(168, 85, 247, 0.5)"
                  strokeWidth="0.5"
                />
                {/* Debugging */}
                <path
                  d="M0,26 C10,25 20,22 30,24 C40,26 50,21 60,20 C70,19 80,19 90,17 L90,30 L0,30 Z"
                  fill="rgba(236, 72, 153, 0.2)"
                  stroke="rgba(236, 72, 153, 0.5)"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
            <div>Start</div>
            <div>Middle</div>
            <div>End</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            <span>Vibe Coding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
            <span>Project Organization</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
            <span>AI Tools</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
            <span>Debugging</span>
          </div>
        </div>
      </div>
    </div>
  )
} 