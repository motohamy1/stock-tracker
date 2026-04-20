'use client';

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import AlertModal from "./AlertModal";

interface WatchlistAlertButtonProps {
    symbol: string;
    company: string;
    currentPrice?: number;
    alertsCount?: number;
}

export default function WatchlistAlertButton({
    symbol,
    company,
    currentPrice,
    alertsCount = 0,
}: WatchlistAlertButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="add-alert mx-auto relative group"
            >
                <AlertCircle size={14} />
                Alert
                {alertsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-gray-900">
                        {alertsCount}
                    </span>
                )}
            </button>
            <AlertModal
                symbol={symbol}
                company={company}
                currentPrice={currentPrice}
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}
