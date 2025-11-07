"use client";
import { Bot, MoreHorizontal, Plus, Send, Settings, User } from "lucide-react";
import { useState } from "react";

export default function DemoPage() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-white/10 flex flex-col">
        {/* Sidebar Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-white font-semibold text-sm">AI SDK</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button className="w-full px-4 py-[14px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2.5 text-white/90 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-2">
            {/* Active Chat */}
            <div className="px-4 py-[14px] bg-white/10 rounded-lg cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm truncate leading-relaxed">
                    explain in-depth the technical implementation...
                  </p>
                  <p className="text-white/40 text-xs mt-2">01:36 PM</p>
                </div>
              </div>
            </div>

            {/* Other Chat */}
            <div className="px-4 py-[14px] hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-sm truncate leading-relaxed">
                    GPT-6 thought for 33 seconds
                  </p>
                  <p className="text-white/30 text-xs mt-2">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col border-r border-white/10">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-pink-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <span className="text-white/90 text-sm font-medium">GPT-5</span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-white/5 rounded-md transition-colors">
                <Settings className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">
              {/* User Message */}
              <div className="flex gap-5">
                <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-white/90 text-[15px] leading-7">
                    explain in-depth the technical implementation of PPO for
                    fine-tuning with reinforcement learning
                  </div>
                  <div className="text-white/40 text-xs mt-3">01:36 PM</div>
                </div>
              </div>

              {/* Assistant Message */}
              <div className="flex gap-5">
                <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-white/40 text-xs mb-4 flex items-center gap-2">
                    <span className="text-white/60">
                      GPT-5 thought for 33 seconds
                    </span>
                    <span className="text-white/30">→</span>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white/90 text-[15px] leading-7 space-y-6">
                      <p>
                        Below is a practical, implementation-oriented
                        walkthrough of PPO (Proximal Policy Optimization) as
                        used to fine-tune pretrained models with reinforcement
                        learning. It covers the core objective, data flow,
                        advantage/return computation, the update loop, and the
                        RLHF specifics for language models.
                      </p>

                      <div className="space-y-5">
                        <div>
                          <h3 className="text-white/95 font-semibold text-[15px] mb-3">
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
                          <h3 className="text-white/95 font-semibold text-[15px] mb-3">
                            2. Core model components
                          </h3>
                          <ul className="space-y-3 text-white/80">
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
          <div className="border-t border-white/10 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-3.5 pr-14 text-white/90 placeholder:text-white/40 text-[15px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white/60" />
              </div>
              <span className="text-white/90 text-sm font-medium">
                GPT-5 o1+1
              </span>
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-white/5 rounded-md transition-colors">
                <Settings className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">
              {/* Assistant Message with List */}
              <div className="flex gap-5">
                <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white/90 text-[15px] leading-7 space-y-6">
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
          <div className="border-t border-white/10 p-6">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-5 py-3.5 pr-14 text-white/90 placeholder:text-white/40 text-[15px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
