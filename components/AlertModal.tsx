'use client';

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createAlert, getAlertsForSymbol, deleteAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";
import { Loader2, Trash2, Bell } from "lucide-react";
import { AlertItem } from "@/database/models/alert.model";

interface AlertModalProps {
    symbol: string;
    company: string;
    currentPrice?: number;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function AlertModal({
    symbol,
    company,
    currentPrice,
    open,
    setOpen,
}: AlertModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [existingAlerts, setExistingAlerts] = useState<AlertItem[]>([]);
    const [alertName, setAlertName] = useState(`${symbol} Price Alert`);
    const [alertType, setAlertType] = useState<'upper' | 'lower'>('upper');
    const [threshold, setThreshold] = useState<string>(currentPrice?.toString() || "");

    const fetchAlerts = useCallback(async () => {
        setFetching(true);
        try {
            const alerts = await getAlertsForSymbol(symbol);
            setExistingAlerts(alerts);
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        } finally {
            setFetching(false);
        }
    }, [symbol]);

    useEffect(() => {
        if (open) {
            if (currentPrice) {
                setThreshold(currentPrice.toString());
            }
            setAlertName(`${symbol} Price Alert`);
            fetchAlerts();
        }
    }, [symbol, currentPrice, open, fetchAlerts]);

    const handleDeleteAlert = async (id: string) => {
        try {
            const result = await deleteAlert(id);
            if (result.success) {
                toast.success("Alert deleted");
                fetchAlerts();
            } else {
                toast.error("Failed to delete alert");
            }
        } catch {
            toast.error("An error occurred");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!threshold || isNaN(parseFloat(threshold))) {
            toast.error("Please enter a valid price threshold");
            return;
        }

        setLoading(true);
        try {
            const result = await createAlert({
                symbol,
                company,
                alertName,
                alertType,
                threshold: parseFloat(threshold),
                isActive: true,
            });

            if (result.success) {
                toast.success(`Alert created for ${symbol}`);
                fetchAlerts();
                // We don't necessarily close the modal if they want to add more or see existing
                // but user asked for "modal of creating alert appear"
                // maybe keep it open to show the new alert in the list?
                // Let's keep it open but reset the form
                setAlertName(`${symbol} Price Alert`);
            } else {
                toast.error(result.error || "Failed to create alert");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-100 border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Manage Price Alerts</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Set target prices for {company} ({symbol}) and we&apos;ll notify you.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                    {/* Create New Alert Section */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-b border-gray-800 pb-6">
                        <div className="space-y-2">
                            <Label htmlFor="alertName" className="text-sm font-medium text-gray-300">
                                Alert Name
                            </Label>
                            <Input
                                id="alertName"
                                value={alertName}
                                onChange={(e) => setAlertName(e.target.value)}
                                placeholder="My Alert"
                                className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-yellow-500 focus:border-yellow-500 h-9"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="alertType" className="text-sm font-medium text-gray-300">
                                    Condition
                                </Label>
                                <Select
                                    value={alertType}
                                    onValueChange={(value: 'upper' | 'lower') => setAlertType(value)}
                                >
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 h-9">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                                        <SelectItem value="upper">Price Above</SelectItem>
                                        <SelectItem value="lower">Price Below</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="threshold" className="text-sm font-medium text-gray-300">
                                    Price Target ($)
                                </Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    step="0.01"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-yellow-500 focus:border-yellow-500 h-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {currentPrice && (
                                <p className="text-xs text-gray-500 italic">
                                    Current: ${currentPrice.toFixed(2)}
                                </p>
                            )}
                            <Button
                                type="submit"
                                disabled={loading}
                                size="sm"
                                className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600 font-bold"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Create Alert"
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Existing Alerts Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Existing Alerts ({existingAlerts.length})
                        </h3>
                        
                        {fetching ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                            </div>
                        ) : existingAlerts.length === 0 ? (
                            <p className="text-xs text-gray-500 py-2">No active alerts for this stock.</p>
                        ) : (
                            <div className="space-y-2">
                                {existingAlerts.map((alert) => (
                                    <div key={alert._id} className="bg-gray-800/50 border border-gray-700 rounded-md p-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-100">{alert.alertName}</p>
                                            <p className="text-xs text-gray-400">
                                                {alert.alertType === 'upper' ? 'Above' : 'Below'} ${alert.threshold.toFixed(2)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAlert(alert._id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white w-full"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
