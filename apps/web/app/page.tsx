import Link from 'next/link';
import NextImage from 'next/image';
import {
  Card,
  CardContent,
  StatusBadge,
  ProgressBar,
  EmptyState,
  EmptyIcon,
} from '@/components/ui';
import { PageContainer } from '@/components/layout';
import { getTrendingProjects } from '@/lib/data/projects';
import { MultiChainConnectWallet } from '@/components/wallet/MultiChainConnectWallet';
import { 
  Globe, 
  PlusCircle, 
  MessageSquare, 
  Lock, 
  Gift, 
  ShieldCheck, 
  Cpu, 
  Coins, 
  Mic2, 
  Timer,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

const MENU_ITEMS = [
  { 
    label: 'Explore Project', 
    description: 'All networks, live & upcoming',
    href: '/explore', 
    icon: Globe, 
    image: '/assets/icons-3d/explore-globe.png',
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10', 
    border: 'hover:border-blue-500/50', 
    shadow: 'hover:shadow-blue-500/20' 
  },
  { 
    label: 'Create Project', 
    description: 'Presale, Fairlaunch, Bonding',
    href: '/create', 
    icon: PlusCircle, 
    image: '/assets/icons-3d/create-rocket.png',
    color: 'text-green-500', 
    bg: 'bg-green-500/10', 
    border: 'hover:border-green-500/50', 
    shadow: 'hover:shadow-green-500/20' 
  },
  { 
    label: 'SelsiFeed', 
    description: 'Social feed & updates',
    href: '/feed', 
    icon: MessageSquare, 
    image: '/assets/icons-3d/feed-chat.png',
    color: 'text-pink-500', 
    bg: 'bg-pink-500/10', 
    border: 'hover:border-pink-500/50', 
    shadow: 'hover:shadow-pink-500/20' 
  },
  { 
    label: 'Reward Referral', 
    description: 'Invite & earn rewards',
    href: '/rewards', 
    icon: Gift, 
    image: '/assets/icons-3d/reward-gift.png',
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10', 
    border: 'hover:border-yellow-500/50', 
    shadow: 'hover:shadow-yellow-500/20' 
  },
  { 
    label: 'Vesting', 
    description: 'Manage token vesting',
    href: '/vesting', 
    icon: Timer, 
    image: '/assets/icons-3d/vesting-timer.png',
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10', 
    border: 'hover:border-orange-500/50', 
    shadow: 'hover:shadow-orange-500/20' 
  },
  { 
    label: 'LP Lock', 
    description: 'Secure liquidity locking',
    href: '/explore?filter=locked', 
    icon: Lock, 
    image: '/assets/icons-3d/lock-security.png',
    color: 'text-cyan-500', 
    bg: 'bg-cyan-500/10', 
    border: 'hover:border-cyan-500/50', 
    shadow: 'hover:shadow-cyan-500/20' 
  },
  { 
    label: 'SBT Staking', 
    description: 'Stake for tier benefits',
    href: '/staking/sbt', 
    icon: ShieldCheck, 
    image: '/assets/icons-3d/sbt-shield.png',
    color: 'text-purple-500', 
    bg: 'bg-purple-500/10', 
    border: 'hover:border-purple-500/50', 
    shadow: 'hover:shadow-purple-500/20' 
  },
  { 
    label: 'AMA Developer', 
    description: 'Ask developers anything',
    href: '/ama', 
    icon: Mic2, 
    image: '/assets/icons-3d/ama-mic.png',
    color: 'text-indigo-500', 
    bg: 'bg-indigo-500/10', 
    border: 'hover:border-indigo-500/50', 
    shadow: 'hover:shadow-indigo-500/20' 
  },
  { 
    label: 'Selsi Tech', 
    description: 'Coming Soon',
    href: '#', 
    icon: Cpu, 
    image: null,
    color: 'text-gray-500', 
    bg: 'bg-gray-500/10', 
    border: 'hover:border-gray-500/50', 
    shadow: 'hover:shadow-gray-500/20', 
    disabled: true, 
    badge: 'SOON' 
  },
  { 
    label: 'Selsi Token Series A', 
    description: 'Coming Soon',
    href: '#', 
    icon: Coins, 
    image: null,
    color: 'text-gray-500', 
    bg: 'bg-gray-500/10', 
    border: 'hover:border-gray-500/50', 
    shadow: 'hover:shadow-gray-500/20', 
    disabled: true, 
    badge: 'SOON' 
  },
];

export default async function HomePage() {
  const trending = await getTrendingProjects();
  const topTrending = trending.length > 0 ? trending[0] : null;

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-page/80 backdrop-blur-md border-b border-border-subtle safe-top">
        <PageContainer>
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SELSIPAD
            </h1>

            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hover:scale-105 transition-transform"
                aria-label="Profile"
              >
                <NextImage 
                  src="/assets/user-avatar-3d.png" 
                  alt="Profile" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 rounded-full border border-white/10 hover:border-primary-main/50 transition-colors shadow-lg"
                />
              </Link>
              <MultiChainConnectWallet />
            </div>
          </div>
        </PageContainer>
      </header>

      <PageContainer className="py-8 space-y-10">
        
        {/* Trending Section */}
        <div className="space-y-4">
           {/* Section Header */}
           <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Trending Projects</h2>
              <TrendingUpIcon className="w-6 h-6 text-indigo-400 animate-pulse" />
           </div>

           {/* Trending Card */}
           {topTrending ? (
            <Link href={`/project/${topTrending.id}`}>
               <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/50 via-gray-900/50 to-slate-950/50 backdrop-blur-xl border border-indigo-500/20 group hover:border-indigo-400/50 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.3)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transform">
                  {/* Animated Background Mesh */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-transparent blur-3xl group-hover:opacity-30 transition-opacity duration-700" />
                  
                  <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 z-10">
                     {/* Logo / Image */}
                     <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-4xl shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
                           {topTrending.symbol.slice(0, 2)}
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-orange-400/50 flex items-center gap-1 animate-bounce">
                          🔥 #1 Hot
                        </div>
                     </div>

                     {/* Content */}
                     <div className="flex-1 text-center md:text-left space-y-3 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300">
                              {topTrending.name}
                           </h2>
                           <div className="hidden md:block transform group-hover:rotate-3 transition-transform">
                              <StatusBadge status={topTrending.status} />
                           </div>
                        </div>
                        
                        <p className="text-indigo-200/70 line-clamp-2 max-w-2xl text-sm md:text-base font-medium group-hover:text-indigo-100 transition-colors">
                          {topTrending.description}
                        </p>

                        <div className="pt-4 w-full max-w-lg">
                           <div className="flex justify-between items-end mb-2">
                              <span className="text-sm font-semibold text-gray-400">Total Raised</span>
                              <span className="text-lg font-bold text-white">
                                <span className="text-indigo-400">{topTrending.raised}</span> 
                                <span className="text-gray-500 mx-1">/</span> 
                                {topTrending.target} {topTrending.network}
                              </span>
                           </div>
                           <div className="h-3 bg-gray-900/50 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                                style={{ width: `${(topTrending.raised / topTrending.target) * 100}%` }}
                              >
                                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-gray-900/20 backdrop-blur-xl border border-white/5 p-12 text-center group hover:border-white/10 transition-colors">
               <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent" />
               <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <TrendingUpIcon className="w-8 h-8 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 group-hover:text-gray-200 transition-colors">No Trending Projects</h3>
                  <p className="text-gray-600 group-hover:text-gray-500 transition-colors">Be the first to create a hype!</p>
               </div>
            </div>
          )}
        </div>

        {/* Explore Section */}
        <div className="space-y-4">
           {/* Section Header */}
           <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Explore SelsiPad</h2>
           </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {MENU_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={idx} 
                    href={item.disabled ? '#' : item.href}
                    className={`relative group ${item.disabled ? 'cursor-not-allowed opacity-60' : 'active:scale-[0.96] transition-transform duration-200'}`}
                  >
                    <div className={`
                      relative h-full overflow-hidden rounded-3xl border border-white/5 bg-gray-900/40 backdrop-blur-xl 
                      transition-all duration-500 ease-out
                      ${!item.disabled ? `group-hover:-translate-y-2 ${item.border} ${item.shadow} group-hover:shadow-2xl` : ''}
                    `}>
                      
                      {/* Internal Glow Gradient */}
                      <div className={`
                        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                        bg-gradient-to-br from-white/5 to-transparent pointer-events-none
                      `} />

                      {/* Large Background 3D Icon or Fallback Icon */}
                      {item.image ? (
                         <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                           <NextImage 
                             src={item.image} 
                             alt={item.label} 
                             fill
                             className="object-cover opacity-60 mix-blend-screen scale-110 group-hover:scale-125 transition-transform duration-700"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-gray-900/40" />
                         </div>
                      ) : (
                         <div className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
                            <Icon className="w-full h-full" />
                         </div>
                      )}

                      <div className="relative p-6 flex flex-col justify-end min-h-[180px] md:min-h-[220px] z-10">
                        <div className="space-y-3">
                           <div>
                             <h3 className="text-xl md:text-2xl font-black text-white/90 group-hover:text-white transition-colors leading-tight tracking-tight">
                               {item.label}
                             </h3>
                             <p className="text-sm text-gray-400 group-hover:text-gray-300 font-medium leading-relaxed mt-2 max-w-[70%]">
                               {item.description}
                             </p>
                           </div>
                        </div>

                        {item.badge && (
                          <div className="absolute top-6 right-6">
                             <span className="text-[10px] uppercase font-bold bg-white/10 text-white/70 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-md">
                               {item.badge}
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-center text-[10px] md:text-xs text-gray-500 max-w-4xl mx-auto leading-relaxed">
            <span className="font-semibold text-gray-400">Disclaimer:</span> Selsipad will never endorse or encourage that you invest in any of the projects listed and therefore, accept no liability for any loss occasioned. It is the user(s) responsibility to do their own research and seek financial advice from a professional. More information about (DYOR) can be found via <a href="https://academy.binance.com/en" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">Binance Academy</a>.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}


