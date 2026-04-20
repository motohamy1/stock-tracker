import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Loader2, TrendingUp, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { searchStocks } from '@/lib/actions/finnhub.actions'
import WatchlistButton from './WatchlistButton'
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions'

interface SearchCommandProps {
    renderAs?: 'button' | 'text'
    label?: string
    intialStocks: StockWithWatchlistStatus[]
    isAuthenticated?: boolean
    userEmail?: string | null
}

export default function SearchCommand({ 
    renderAs = 'button', 
    label = 'Add stock', 
    intialStocks,
    isAuthenticated,
    userEmail
}: SearchCommandProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(intialStocks)
    const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([])

    const isSearchMode = searchTerm.trim();
    const displayStocks = stocks;

    useEffect(() => {
        if (open && isAuthenticated && userEmail) {
            getWatchlistSymbolsByEmail(userEmail).then(setWatchlistSymbols);
        }
    }, [open, isAuthenticated, userEmail]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleSearch = async () => {
        if (!isSearchMode) return setStocks(intialStocks);

        setLoading(true)
        try {
            const results = await searchStocks(searchTerm.trim());
            setStocks(results);

        } catch {
            setStocks([])
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useDebounce(handleSearch, 500)
    useEffect(() => {
        debouncedSearch()
    }, [searchTerm, debouncedSearch])

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm('');
        setStocks(intialStocks);
    }

    return (
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setOpen(true)} className='search-text'>
                    {label}
                </span>
            ) : (
                <button onClick={() => setOpen(true)} className='search-btn'>
                    <Search className='h-4 w-4 mr-1' />
                    {label}
                </button>
            )}


            <CommandDialog open={open} onOpenChange={setOpen}
                className='search-dialog'>

                <div className='search-field'>
                    <CommandInput
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className='search-input'
                    />
                    {loading && <Loader2 className='search-loader' />}
                </div>
                <CommandList className='search-list'>
                    {loading ? (
                        <CommandEmpty className='search-list-empty'>Loading Stocks...</CommandEmpty>
                    ) : displayStocks?.length === 0 ? (
                        <CommandEmpty className='search-list-empty'>
                            {isSearchMode ? 'No results found' : 'No stocks available'}
                        </CommandEmpty>
                    ) : (
                        <CommandGroup heading={isSearchMode ? 'Search results' : 'Popular stocks'}>
                            {displayStocks?.map((stock) => (
                                <CommandItem
                                    key={stock.symbol}
                                    onSelect={() => {
                                        handleSelectStock()
                                        router.push(`/stocks/${stock.symbol}`)
                                    }}
                                    className='search-item'
                                >
                                    <div className='flex items-center gap-3 w-full'>
                                        <TrendingUp className='h-4 w-4 text-gray-500' />
                                        <div className='flex-1 flex flex-col'>
                                            <span className='font-medium text-gray-100'>{stock.name}</span>
                                            <span className='text-xs text-gray-500'>
                                                {stock.symbol} | {stock.exchange} | {stock.type}
                                            </span>
                                        </div>
                                        <WatchlistButton
                                            symbol={stock.symbol}
                                            company={stock.name}
                                            isInWatchlist={watchlistSymbols.includes(stock.symbol.toUpperCase())}
                                            isAuthenticated={isAuthenticated}
                                            type="icon"
                                        />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}