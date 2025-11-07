"use client";
import { Bot, MoreHorizontal, Plus, Send, Settings, User, ChevronDown, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const MODELS = [
  {
    id: "qwen3-coder-plus",
    name: "Qwen3 Coder Plus",
    icon: "🔷",
    isPro: true,
    provider: "Alibaba Cloud",
    description: "Powered by Qwen3 this is a powerful Coding Agent that excels in tool calling and environment interaction to achieve autonomous programming. It combines outstanding coding proficiency with versatile general-purpose abilities.",
    context: "1000,000 tokens",
    inputPricing: "$1.00 / million tokens",
    outputPricing: "$5.00 / million tokens",
    uptime: "100.00%"
  },
  {
    id: "qwen3-max",
    name: "Qwen3 Max",
    icon: "🔷",
    isPro: true,
    provider: "Alibaba Cloud",
    description: "The most powerful model in the Qwen3 family, offering exceptional performance across all tasks.",
    context: "1000,000 tokens",
    inputPricing: "$2.00 / million tokens",
    outputPricing: "$6.00 / million tokens",
    uptime: "99.98%"
  },
  {
    id: "qwen3-max-preview",
    name: "Qwen3 Max Preview",
    icon: "🔷",
    isPro: true,
    provider: "Alibaba Cloud",
    description: "Preview version of Qwen3 Max with experimental features and improvements.",
    context: "1000,000 tokens",
    inputPricing: "$1.50 / million tokens",
    outputPricing: "$5.50 / million tokens",
    uptime: "99.50%"
  },
  {
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    icon: "AI",
    isPro: true,
    provider: "Anthropic",
    description: "Fast and efficient model for quick responses and high-volume tasks.",
    context: "200,000 tokens",
    inputPricing: "$0.25 / million tokens",
    outputPricing: "$1.25 / million tokens",
    uptime: "99.99%"
  },
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    icon: "AI",
    isPro: true,
    provider: "Anthropic",
    description: "Balanced model offering excellent performance across a wide range of tasks.",
    context: "200,000 tokens",
    inputPricing: "$3.00 / million tokens",
    outputPricing: "$15.00 / million tokens",
    uptime: "99.99%"
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    icon: "AI",
    isPro: true,
    provider: "Anthropic",
    description: "Compact model optimized for speed and cost-effectiveness.",
    context: "200,000 tokens",
    inputPricing: "$0.25 / million tokens",
    outputPricing: "$1.25 / million tokens",
    uptime: "99.95%"
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    icon: "AI",
    isPro: true,
    provider: "Anthropic",
    description: "Most capable Claude 3 model for complex tasks requiring deep reasoning.",
    context: "200,000 tokens",
    inputPricing: "$15.00 / million tokens",
    outputPricing: "$75.00 / million tokens",
    uptime: "99.99%"
  },
];

export default function DemoPage() {
  const [inputValue, setInputValue] = useState("");
  const [leftModelDropdownOpen, setLeftModelDropdownOpen] = useState(false);
  const [rightModelDropdownOpen, setRightModelDropdownOpen] = useState(false);
  const [leftSelectedModel, setLeftSelectedModel] = useState(MODELS[0]);
  const [rightSelectedModel, setRightSelectedModel] = useState(MODELS[4]);
  const [modelSearchLeft, setModelSearchLeft] = useState("");
  const [modelSearchRight, setModelSearchRight] = useState("");
  const [hoveredModelLeft, setHoveredModelLeft] = useState<typeof MODELS[0] | null>(null);
  const [hoveredModelRight, setHoveredModelRight] = useState<typeof MODELS[0] | null>(null);

  const leftDropdownRef = useRef<HTMLDivElement>(null);
  const rightDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (leftDropdownRef.current && !leftDropdownRef.current.contains(event.target as Node)) {
        setLeftModelDropdownOpen(false);
      }
      if (rightDropdownRef.current && !rightDropdownRef.current.contains(event.target as Node)) {
        setRightModelDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-zinc-800 flex flex-col bg-black">
        {/* Sidebar Header */}
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-700"></div>
            <span className="text-white font-mono font-bold text-sm tracking-tight">AI SDK</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="border-b border-zinc-800">
          <button className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border-b border-zinc-800 flex items-center justify-center gap-2 text-white text-sm font-mono transition-colors">
            <Plus className="w-4 h-4" />
            NEW CHAT
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div>
            {/* Active Chat */}
            <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate leading-snug font-mono">
                    explain in-depth the technical implementation...
                  </p>
                  <p className="text-zinc-600 text-xs font-mono">01:36 PM</p>
                </div>
              </div>
            </div>

            {/* Other Chat */}
            <div className="px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 cursor-pointer transition-colors">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-zinc-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-400 text-sm truncate leading-snug font-mono">
                    GPT-6 thought for 33 seconds
                  </p>
                  <p className="text-zinc-700 text-xs font-mono">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Chat Title Header - Above both panels */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <h1 className="text-white text-base font-mono font-bold tracking-tight">TECHNICAL IMPLEMENTATION OF PPO FOR FINE-TUNING</h1>
          <p className="text-zinc-600 text-xs font-mono">2 VERSIONS • STARTED 2 HOURS AGO</p>
        </div>

        {/* Split View Panels */}
        <div className="flex-1 flex bg-black">
          {/* Left Panel */}
          <div className="flex-1 flex flex-col bg-black border-r border-zinc-800 overflow-hidden">
            {/* Model Header */}
            <div className="h-11 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-950">
              <div className="relative" ref={leftDropdownRef}>
                <button
                  onClick={() => setLeftModelDropdownOpen(!leftModelDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
                >
                  <span className="text-base">{leftSelectedModel.icon}</span>
                  <span className="text-white text-sm font-mono">{leftSelectedModel.name}</span>
                  {leftSelectedModel.isPro && (
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
                      PRO
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown */}
                {leftModelDropdownOpen && (
                  <div className="absolute top-full left-0 flex z-50">
                    {/* Dropdown Menu */}
                    <div className="w-64 bg-black border border-zinc-800 shadow-2xl">
                      {/* Search */}
                      <div className="border-b border-zinc-800">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                          <input
                            type="text"
                            placeholder="SEARCH MODELS..."
                            value={modelSearchLeft}
                            onChange={(e) => setModelSearchLeft(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border-0 text-sm text-white placeholder:text-zinc-700 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Model List */}
                      <div className="max-h-80 overflow-y-auto">
                        {MODELS.filter(m => m.name.toLowerCase().includes(modelSearchLeft.toLowerCase())).map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setLeftSelectedModel(model);
                              setLeftModelDropdownOpen(false);
                              setModelSearchLeft("");
                              setHoveredModelLeft(null);
                            }}
                            onMouseEnter={() => setHoveredModelLeft(model)}
                            onMouseLeave={() => setHoveredModelLeft(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 transition-colors text-left"
                          >
                            <span className="text-base">{model.icon}</span>
                            <span className="text-white text-sm flex-1 font-mono">{model.name}</span>
                            {model.isPro && (
                              <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
                                PRO
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Card */}
                    {hoveredModelLeft && (
                      <div className="w-72 bg-black border-l border-zinc-800 shadow-2xl">
                        <div className="p-3 space-y-3">
                          {/* Header */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-base">{hoveredModelLeft.icon}</span>
                              <span className="text-white text-xs font-mono font-bold">
                                {hoveredModelLeft.provider.toUpperCase()}
                              </span>
                              <span className="text-zinc-600 text-xs">/</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelLeft.name}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-snug">
                              {hoveredModelLeft.description}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">CONTEXT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelLeft.context}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">INPUT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelLeft.inputPricing}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">OUTPUT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelLeft.outputPricing}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-zinc-800">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-zinc-600 text-xs font-mono">UPTIME</span>
                                <span className="text-white text-xs font-mono">
                                  {hoveredModelLeft.uptime}
                                </span>
                              </div>
                              {/* Uptime Graph Placeholder */}
                              <div className="h-6 bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                                <div className="flex gap-0.5 h-3">
                                  {Array.from({ length: 50 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-0.5 bg-zinc-700"
                                      style={{ height: `${Math.random() * 100}%` }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-zinc-700 text-[10px] font-mono">12 HRS AGO</span>
                                <span className="text-zinc-700 text-[10px] font-mono">NOW</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                  <Settings className="w-4 h-4 text-zinc-500" />
                </button>
                <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-black">
            <div>
              {/* User Message */}
              <div className="flex gap-3 px-3 py-3">
                <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm leading-6">
                    explain in-depth the technical implementation of PPO for
                    fine-tuning with reinforcement learning
                  </div>
                  <div className="text-zinc-600 text-xs font-mono">01:36 PM</div>
                </div>
              </div>

              {/* Assistant Message */}
              <div className="flex gap-3 px-3 py-3">
                <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-zinc-600 text-xs mb-3 flex items-center gap-2 font-mono">
                    <span className="text-zinc-500">
                      GPT-5 THOUGHT FOR 33 SECONDS
                    </span>
                    <span className="text-zinc-700">→</span>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-zinc-300 text-sm leading-6 space-y-4">
                      <p>
                        Below is a practical, implementation-oriented
                        walkthrough of PPO (Proximal Policy Optimization) as
                        used to fine-tune pretrained models with reinforcement
                        learning. It covers the core objective, data flow,
                        advantage/return computation, the update loop, and the
                        RLHF specifics for language models.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white/95 font-semibold text-sm mb-2">
                            1. High-level Idea
                          </h3>
                          <p className="text-white/80 mb-3">
                            PPO maximizes a policy gradient objective but
                            constrains each update to stay close to the
                            data-collecting policy using a clipped importance
                            ratio. This helps training stable without computing
                            accurate trust regions.
                          </p>
                          <p className="text-white/80">
                            It jointly fits a value function (baseline) to
                            reduce variance, and often includes an entropy bonus
                            to preserve exploration.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-white/95 font-semibold text-sm mb-2">
                            2. Core model components
                          </h3>
                          <ul className="space-y-2 text-white/80">
                            <li className="pl-1">
                              <strong className="text-white/90">
                                Policy network π(a|s):
                              </strong>{" "}
                              outputs a distribution over actions. For LLMs,
                              this is the language model's next-token
                              distribution conditioned on the context.
                            </li>
                            <li className="pl-1">
                              <strong className="text-white/90">
                                Value function V(s):
                              </strong>{" "}
                              predicts expected return given state s. In LLM
                              RLHF, this is usually a small value head on top of
                              the transformer trunk, sharing most parameters
                              with the policy or as a separate head.
                            </li>
                            <li className="pl-1">
                              <strong className="text-white/90">
                                (RLHF) Reference policy π_ref:
                              </strong>{" "}
                              a frozen copy of the supervised-finetuned model
                              used to compute a KL penalty.
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-white/95 font-semibold text-[15px] mb-3">
                            3. Objective and losses: L_π_t, L_v, rewards, Â_t,
                            advantage, and R_t returns/targets for the value
                            function
                          </h3>
                          <div className="space-y-4 text-white/80">
                            <div>
                              <p className="mb-2">
                                <strong className="text-white/90">
                                  Policy surrogate (clipped):
                                </strong>
                              </p>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm">
                                <div>
                                  L_clip = E_t[ min( r(θ) Â_t, clip(r, 1-ε, 1+ε)
                                  Â_t ) ]
                                </div>
                                <div className="mt-2 text-white/60">
                                  where r_(θθ) = exp( log π(a_t|s_t) - log
                                  π(a_(θθ_old)|s_t) )
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="mb-2">
                                <strong className="text-white/90">
                                  Value loss:
                                </strong>
                              </p>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm">
                                <div>L_vf = E_t[ (V(s_t) - R_t)^2 ]</div>
                                <div className="mt-2 text-white/60">
                                  Optionally "clip" the value update against old
                                  values: max( V_θ(s)^2, (clip(V_θ, V_old±ε))^2
                                  )
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="mb-2">
                                <strong className="text-white/90">
                                  Entropy bonus:
                                </strong>
                              </p>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm">
                                <div>
                                  S_t = H(π(·|s_t)) = -E_a[log π(a|s_t)]
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-800 bg-black">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="TYPE YOUR MESSAGE..."
                rows={1}
                className="w-full bg-zinc-950 border-0 px-3 py-3 pr-12 text-white placeholder:text-zinc-700 text-sm resize-none focus:outline-none font-mono"
              />
              <button className="absolute right-3 top-3 p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                <Send className="w-3.5 h-3.5 text-zinc-300" />
              </button>
            </div>
          </div>
        </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col bg-black overflow-hidden">
            {/* Model Header */}
            <div className="h-11 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-950">
              <div className="relative" ref={rightDropdownRef}>
                <button
                  onClick={() => setRightModelDropdownOpen(!rightModelDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
                >
                  <span className="text-base">{rightSelectedModel.icon}</span>
                  <span className="text-white text-sm font-mono">{rightSelectedModel.name}</span>
                  {rightSelectedModel.isPro && (
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
                      PRO
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown */}
                {rightModelDropdownOpen && (
                  <div className="absolute top-full left-0 flex z-50">
                    {/* Dropdown Menu */}
                    <div className="w-64 bg-black border border-zinc-800 shadow-2xl">
                      {/* Search */}
                      <div className="border-b border-zinc-800">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                          <input
                            type="text"
                            placeholder="SEARCH MODELS..."
                            value={modelSearchRight}
                            onChange={(e) => setModelSearchRight(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-2 bg-zinc-950 border-0 text-sm text-white placeholder:text-zinc-700 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Model List */}
                      <div className="max-h-80 overflow-y-auto">
                        {MODELS.filter(m => m.name.toLowerCase().includes(modelSearchRight.toLowerCase())).map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setRightSelectedModel(model);
                              setRightModelDropdownOpen(false);
                              setModelSearchRight("");
                              setHoveredModelRight(null);
                            }}
                            onMouseEnter={() => setHoveredModelRight(model)}
                            onMouseLeave={() => setHoveredModelRight(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-950 border-b border-zinc-800 transition-colors text-left"
                          >
                            <span className="text-base">{model.icon}</span>
                            <span className="text-white text-sm flex-1 font-mono">{model.name}</span>
                            {model.isPro && (
                              <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs font-mono border border-zinc-700">
                                PRO
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Card */}
                    {hoveredModelRight && (
                      <div className="w-72 bg-black border-l border-zinc-800 shadow-2xl p-3">
                        <div className="space-y-3">
                          {/* Header */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-base">{hoveredModelRight.icon}</span>
                              <span className="text-white text-xs font-mono font-bold">
                                {hoveredModelRight.provider.toUpperCase()}
                              </span>
                              <span className="text-zinc-600 text-xs">/</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelRight.name}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-xs leading-snug">
                              {hoveredModelRight.description}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">CONTEXT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelRight.context}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">INPUT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelRight.inputPricing}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                              <span className="text-zinc-600 text-xs font-mono">OUTPUT</span>
                              <span className="text-white text-xs font-mono">
                                {hoveredModelRight.outputPricing}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-zinc-800">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-zinc-600 text-xs font-mono">UPTIME</span>
                                <span className="text-white text-xs font-mono">
                                  {hoveredModelRight.uptime}
                                </span>
                              </div>
                              {/* Uptime Graph Placeholder */}
                              <div className="h-6 bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                                <div className="flex gap-0.5 h-3">
                                  {Array.from({ length: 50 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="w-0.5 bg-zinc-700"
                                      style={{ height: `${Math.random() * 100}%` }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-zinc-700 text-[10px] font-mono">12 HRS AGO</span>
                                <span className="text-zinc-700 text-[10px] font-mono">NOW</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                  <Settings className="w-4 h-4 text-zinc-500" />
                </button>
                <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-black">
            <div>
              {/* Assistant Message with List */}
              <div className="flex gap-3 px-3 py-3">
                <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="flex-1">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-zinc-300 text-sm leading-6 space-y-4">
                      <ul className="space-y-3 text-white/80 list-none pl-0">
                        <li className="flex gap-3 pl-1">
                          <span className="text-white/60 mt-0.5">•</span>
                          <span>
                            <strong className="text-white/90">
                              Advantage normalization:
                            </strong>{" "}
                            normalize to mean 0 and std 1 per batch.
                          </span>
                        </li>
                        <li className="flex gap-3 pl-1">
                          <span className="text-white/60 mt-0.5">•</span>
                          <span>
                            Avoid degenerate behavior (hallucinations, reward
                            hacking) by mixing in supervised loss or maintaining
                            a replay/behavior cloning buffer to anchor behavior.
                          </span>
                        </li>
                      </ul>

                      <div className="mt-5">
                        <h3 className="text-white/95 font-semibold text-[15px] mb-4">
                          13. A generic PPO/torch-like pseudocode
                        </h3>
                        <ol className="space-y-4 text-white/80 list-decimal pl-6">
                          <li className="pl-2">
                            Initialize old model=value head, π_ref (frozen), the
                            reward model, optimizer.
                          </li>
                          <li className="pl-2">
                            <div className="mb-3">Loop:</div>
                            <ul className="space-y-3 list-none pl-0">
                              <li className="flex gap-3">
                                <span className="text-white/60 mt-0.5">-</span>
                                <span>
                                  Collect N rollouts: for i in 1..N: prompt =
                                  sample_prompt() response, old_logprobs =
                                  sample_from_policy(π_old, prompt) reward =
                                  Reward(prompt) score(prompt, response,
                                  old_logprobs, value_preds, reward)
                                </span>
                              </li>
                              <li className="flex gap-3">
                                <span className="text-white/60 mt-0.5">-</span>
                                <span>
                                  Compute returns and advantages (GAE or
                                  reward-to-go). Normalize advantages.
                                </span>
                              </li>
                              <li className="flex gap-3">
                                <span className="text-white/60 mt-0.5">-</span>
                                <span>
                                  For k in K epochs: for each minibatch of
                                  stored rollouts: recompute new_logprobs,
                                  new_value_preds, entropy from current π, V
                                  old_ratio = exp((new_logprobs - old_logprobs))
                                  # per sequence surrogate =
                                  torch.min(old_ratio·adv,
                                  torch.clamp(old_ratio, 1-ε, 1+ε)·adv) loss =
                                  -surrogate.mean() + c_1·(new_value -
                                  returns())^2 + c_2·(-H) loss.backward();
                                  clip_gradient(); optimizer.step();
                                  optimizer.zero_grad()
                                </span>
                              </li>
                              <li className="flex gap-3">
                                <span className="text-white/60 mt-0.5">-</span>
                                <span>
                                  Optionally adjust c_kl by monitoring Â vs
                                  target
                                </span>
                              </li>
                            </ul>
                          </li>
                        </ol>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-white/95 font-semibold text-[15px] mb-3">
                          Save checkpoints and logging
                        </h3>
                      </div>

                      <div className="mt-5">
                        <h3 className="text-white/95 font-semibold text-[15px] mb-4">
                          14. Common pitfalls and how to avoid them
                        </h3>
                        <ul className="space-y-3 text-white/80 list-none pl-0">
                          <li className="flex gap-3 pl-1">
                            <span className="text-white/60 mt-0.5">-</span>
                            <span>
                              Mismatched indexing between saved old log-probs
                              and recomputed new log-probs: store the token
                              indices and ensure conditions and ensure
                              recomputation uses identical tokenization/padding
                              order.
                            </span>
                          </li>
                          <li className="flex gap-3 pl-1">
                            <span className="text-white/60 mt-0.5">-</span>
                            <span>
                              Using greedy decoding for rollouts: reduces
                              exploration and biases on-policy rollouts; use
                              stochastic sampling (top-k/top-p/temperature
                              tuned).
                            </span>
                          </li>
                          <li className="flex gap-3 pl-1">
                            <span className="text-white/60 mt-0.5">-</span>
                            <span>
                              Very large reward scales: normalize rewards or use
                              smaller learning rates to prevent catastrophic
                              divergences or policy collapse.
                            </span>
                          </li>
                          <li className="flex gap-3 pl-1">
                            <span className="text-white/60 mt-0.5">-</span>
                            <span>
                              Overfitting to reward model: the policy can find
                              adversarial tokens that exploit the reward model —
                              mitigate by improving reward model quality,
                              including human labels, and regularizing with KL
                              to the base policy.
                            </span>
                          </li>
                          <li className="flex gap-3 pl-1">
                            <span className="text-white/60 mt-0.5">-</span>
                            <span>
                              Re-using off-policy data for on-policy updates:
                              avoid unless doing an explicit
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-zinc-800 bg-black">
            <div className="relative">
              <textarea
                placeholder="TYPE YOUR MESSAGE..."
                rows={1}
                className="w-full bg-zinc-950 border-0 px-3 py-3 pr-12 text-white placeholder:text-zinc-700 text-sm resize-none focus:outline-none font-mono"
              />
              <button className="absolute right-3 top-3 p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                <Send className="w-3.5 h-3.5 text-zinc-300" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
