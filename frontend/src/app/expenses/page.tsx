"use client";
import React, { useState, useEffect, useMemo, FC } from 'react';
import SlidingInfoBanner from '../components/SlidingInfoBanner';
import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useInView } from 'react-intersection-observer'; 
import Layout from '../components/Layout';
import { API_BASE_BACKEND, getCookie } from '../utils'; // We still need this for POST requests
import toast from 'react-hot-toast';


interface UserWhoPaid {
    display_name: string;
}
interface GroceryDetail {
    name: string;
    quantity: number;
}
interface Expense {
    id: number;
    category: 'GROCERIES' | 'SHARED_RENTAL' | 'PERSONAL_DUE';
    name: string;
    amount: string;
    user_who_paid: UserWhoPaid;
    details: GroceryDetail[] | null;
    is_recurring: boolean;
    due_day_of_month: number | null;
}
interface PaginatedExpenses {
    next: string | null;
    previous: string | null;
    results: Expense[];
}
interface BannerStats {
    total_groceries: string;
    total_shared_rentals: string;
    your_personal_dues: string;
    member_count: number;
}
interface BannerItem {
    id: number;
    text: string;
}
interface MonthPickerProps {
    selectedMonth: Date | null;
    onChange: (date: Date | null) => void;
}
interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedMonth: Date | null;
    initialData : Expense | null
}
interface ExpenseListProps {
    activeTab: 'GROCERIES' | 'SHARED_RENTAL' | 'PERSONAL_DUE';
    selectedMonth: Date | null;
    onRenewClick : (item: Expense) => void;
}
// This fetcher is for GET requests, so we REMOVE the CSRF token header.
const fetcher = (url: string) => {
    return fetch(url, {
        credentials: 'include' // This is all that's needed for GET
        // headers: { ... } // REMOVED
    }).then(res => {
        if (res.status === 403 || res.status === 401) {
            // Session may have expired
            window.location.href = '/login'; // Or your login page URL
            throw new Error('Session expired or not authenticated');
        }
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    });
};

// --- Timezone Helper (Unchanged) ---
const getMonthUTCEdges = (date: Date|null) => {
    if (date === null){
        toast.error("date cannot be null");
        return;
    }
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return {
        start_date: startOfMonth.toISOString(),
        end_date: endOfMonth.toISOString(),
    };
};

// --- The Main Page Component ---
export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<'GROCERIES' | 'SHARED_RENTAL' | 'PERSONAL_DUE'>('GROCERIES');
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
    const [bannerData, setBannerData] = useState<BannerItem[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<Expense | null>(null);

    useEffect(() => {
        const fetchBannerData = async () => {
            const edges = getMonthUTCEdges(selectedMonth);
            if(!edges){
                return null;
            }
            const { start_date , end_date } = edges;
            try {
                const res = await fetch(
                    `${API_BASE_BACKEND}/api/stats/banner-summary/?start_date=${start_date}&end_date=${end_date}`,{ 
                        credentials: 'include'
                    } 
                );
                if (res.ok) {
                    const data: BannerStats = await res.json();
                    
                    const total_groceries = parseFloat(data.total_groceries as string) || 0;
                    const total_shared_rentals = parseFloat(data.total_shared_rentals as string) || 0;
                    const your_personal_dues = parseFloat(data.your_personal_dues as string) || 0;
                    const member_count = data.member_count;
                    const safeMemberCount = member_count > 0 ? member_count : 1;

                    const houseShare = (total_groceries + total_shared_rentals) / safeMemberCount;
                    const yourShare = houseShare + your_personal_dues;
                    const groceryShare = total_groceries / safeMemberCount;
                    const rentalShare = total_shared_rentals / safeMemberCount;

                    setBannerData([
                        { id: 1, text: `House Monthly Share: $${houseShare.toFixed(2)} per member` },
                        { id: 2, text: `Your Monthly Expense: $${yourShare.toFixed(2)}` },
                        { id: 3, text: `Your Grocery Share: $${groceryShare.toFixed(2)}` },
                        { id: 4, text: `Your Rental Share: $${rentalShare.toFixed(2)}` },
                        { id: 5, text: `Your personal Spendings are: $${your_personal_dues.toFixed(2)}`},
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch banner data:", error);
            }
        };
        fetchBannerData();
    }, [selectedMonth]); 

    const handleRenewClick = (item: Expense) => {
        setModalData(item);
        setIsModalOpen(true);
    };
    const handleAddClick = () => {
        setModalData(null);
        setIsModalOpen(true);
    };

    console.log(bannerData)
    return (
        <Layout houseName={"Expensify"}>
            <SlidingInfoBanner items={bannerData || []} />
            <div className="relative container mx-auto px-4 md:px-6 py-8">
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
                            <MonthPicker
                                selectedMonth={selectedMonth}
                                onChange={setSelectedMonth}
                            />
                        </div>
                        <Link href="/expenses/stats" passHref>
                            <button className="mt-4 md:mt-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                                View Stats
                            </button>
                        </Link>
                    </div>

                    <div className="flex border-b border-gray-200 mb-4">
                        <TabButton
                            title="Groceries"
                            isActive={activeTab === 'GROCERIES'}
                            onClick={() => setActiveTab('GROCERIES')}
                        />
                        <TabButton
                            title="Shared Rentals"
                            isActive={activeTab === 'SHARED_RENTAL'}
                            onClick={() => setActiveTab('SHARED_RENTAL')}
                        />
                        <TabButton
                            title="Personal Dues"
                            isActive={activeTab === 'PERSONAL_DUE'}
                            onClick={() => setActiveTab('PERSONAL_DUE')}
                        />
                    </div>
                    
                    <ExpenseList
                        key={activeTab} // Add a key to force re-mount on tab change
                        activeTab={activeTab}
                        selectedMonth={selectedMonth}
                        onRenewClick={handleRenewClick}
                    />
                </div>
            </div>

            <button
                onClick={handleAddClick}
                className="fixed bottom-8 right-8 bg-lime-600 hover:bg-lime-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl text-4xl z-30"
            >
                +
            </button>
            
            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedMonth={selectedMonth}
                initialData={modalData}
            />
        </Layout>
    );
}

// --- TabButton and MonthPicker (Unchanged) ---
interface TabButtonProps {
    title: string;
    isActive: boolean;
    onClick: () => void;
}
const TabButton: FC<TabButtonProps> = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`py-3 px-6 text-md font-medium transition-colors duration-200
            ${isActive
                ? 'border-b-2 border-lime-600 text-lime-700'
                : 'text-gray-500 hover:text-gray-700'
            }
        `}
    >
        {title}
    </button>
);

const MonthPicker: FC<MonthPickerProps> = ({ selectedMonth, onChange }) => (
    <DatePicker
        selected={selectedMonth}
        onChange={onChange}
        dateFormat="MMMM yyyy"
        showMonthYearPicker
        className="text-lg font-semibold text-gray-600 bg-gray-100 p-2 rounded-lg cursor-pointer"
    />
);


// --- ================================================ ---
// --- === THIS IS THE THIRD FIX === ---
// --- ================================================ ---
const ExpenseList: FC<ExpenseListProps> = ({ activeTab, selectedMonth , onRenewClick }) => {
    
    const getKey = (pageIndex: number, previousPageData: PaginatedExpenses | null): string | null => {
        
        if (!selectedMonth) {
            return null;
        }
        if (pageIndex === 0) {
            const edges = getMonthUTCEdges(selectedMonth);
            if(!edges){
                return null;
            }
            const { start_date , end_date } = edges;
            return `${API_BASE_BACKEND}/api/expenses/?category=${activeTab}&start_date=${start_date}&end_date=${end_date}&page=1`;
        }
        if (!previousPageData?.next) return null;
        return previousPageData.next;
    };
    const { data, error, size, setSize } = useSWRInfinite<PaginatedExpenses>(getKey, fetcher);
    const expenses = useMemo(() => data ? data.flatMap(page => page.results) : [], [data]);

    const isLoadingInitialData = !data && !error;
    const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
    const isEmpty = data?.[0]?.results.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.next === null);

    const { ref, inView } = useInView({ threshold: 0 });

    useEffect(() => {
        if (inView && !isLoadingMore && !isReachingEnd) {
            setSize(size + 1);
        }
    }, [inView, isLoadingMore, isReachingEnd, size, setSize]);

    if (isLoadingInitialData) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Failed to load expenses: {error.message}</div>;
    if (isEmpty) return <div className="text-center p-10 text-gray-500">No expenses found for this month.</div>;

    return (
        <div className="w-full max-h-[600px] overflow-y-auto space-y-2 p-1">
            {expenses.map((item) => {
                if (item.category === 'GROCERIES') return <GroceryCard key={item.id} item={item} />;
                if (item.category === 'SHARED_RENTAL') return <SharedRentalCard key={item.id} item={item} onRenew={onRenewClick} />;
                if (item.category === 'PERSONAL_DUE') return <PersonalDueCard key={item.id} item={item}  onRenew={onRenewClick}/>;
                return null;
            })}

            <div ref={ref} className="h-10 w-full flex items-center justify-center">
                {isLoadingMore && <p>Loading more...</p>}
                {isReachingEnd && !isEmpty && <p className="text-gray-500">End of list.</p>}
            </div>
        </div>
    );
};


// --- Card Components (Unchanged) ---
interface CardProps {
    item: Expense;
    onRenew?: (item: Expense) => void;
}

const getProviderColors = (name: string) => {
    const provider = name.split(' - ')[0].toLowerCase();
    
    if (provider === 'blinkit') {
        return {
            bg: 'bg-amber-200', // Light lime yellow
            text: 'text-lime-800',
            amount: 'text-lime-900'
        };
    }
    if (provider === 'swiggy') {
        return {
            bg: 'bg-orange-50', // Light orange
            text: 'text-orange-800',
            amount: 'text-orange-900'
        };
    }
    if (provider === 'zepto') {
        return {
            bg: 'bg-purple-50', // Light lavender
            text: 'text-purple-800',
            amount: 'text-purple-900'
        };
    }
    // Default fallback
    return {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        amount: 'text-gray-900'
    };
};

const GroceryCard: FC<CardProps> = ({ item }) => {
    // Get the dynamic colors based on the item name
    const colors = getProviderColors(item.name);

    return (
        // REMOVED h-[112px] to allow card to grow
        // ADDED dynamic background color
        <div className={`p-4 rounded-lg shadow border border-gray-100 ${colors.bg}`}>
            <div className="flex justify-between items-start">
                <div>
                    {/* ADDED dynamic text color */}
                    <h3 className={`text-lg font-bold ${colors.text}`}>{item.name}</h3>
                    <p className="text-sm text-gray-500">Paid by: {item.user_who_paid?.display_name || '...'}</p>
                    
                    {/* --- THIS IS THE BULLETED LIST --- */}
                    <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1 font-bold">
                        {item.details?.map((detail, i) => (
                            <li key={i}>
                                {detail.name} (x{detail.quantity})
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* ADDED dynamic amount color */}
                <span className={`text-2xl font-bold ${colors.amount}`}>
                    ${parseFloat(item.amount).toFixed(2)}
                </span>
            </div>
        </div>
    );
};
const SharedRentalCard: FC<CardProps> = ({ item , onRenew }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100 h-[112px]">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-blue-800">{item.name}</h3>
                <p className="text-sm text-gray-500">Paid by: {item.user_who_paid?.display_name || '...'}</p>
                {item.is_recurring && (
                    <p className="text-sm text-blue-600 font-medium">
                        Recurs every month on day {item.due_day_of_month}
                    </p>
                )}
            </div>
            <span className="text-2xl font-bold text-blue-900">${parseFloat(item.amount).toFixed(2)}</span>
        </div>
        {item.is_recurring && onRenew && (
            <button 
                onClick={() => onRenew(item)}
                className="mt-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
            >
                Renew for this Month
            </button>
        )}
    </div>
);
const PersonalDueCard: FC<CardProps> = ({ item , onRenew}) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-100 h-[112px]">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-purple-800">{item.name}</h3>
                {item.is_recurring && (
                    <p className="text-sm text-purple-600 font-medium">
                        Recurs every month on day {item.due_day_of_month}
                    </p>
                )}
            </div>
            <span className="text-2xl font-bold text-purple-900">${parseFloat(item.amount).toFixed(2)}</span>
        </div>
        {item.is_recurring && onRenew && (
            <button 
                onClick={() => onRenew(item)}
                className="mt-2 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200"
            >
                Renew for this Month
            </button>
        )}        
    </div>
);

// --- AddExpenseModal (Unchanged) ---
// Your code here was already correct for CSRF.
const AddExpenseModal: FC<AddExpenseModalProps> = ({ isOpen, onClose, selectedMonth, initialData}) => {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState<'SHARED_RENTAL' | 'PERSONAL_DUE' | null>(null);
    
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [dueDay, setDueDay] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
            if (isOpen) {
                if (initialData) {
                    // We are renewing, so pre-fill the form
                    setCategory(initialData.category as 'SHARED_RENTAL' | 'PERSONAL_DUE');
                    setName(initialData.name);
                    setAmount(parseFloat(initialData.amount).toString());
                    setIsRecurring(initialData.is_recurring);
                    setDueDay(initialData.due_day_of_month?.toString() || '');
                    setStep(2); // Skip step 1
                } else {
                    // We are adding a new item, so just show step 1
                    setStep(1);
                }
            }
    }, [isOpen, initialData]); // Run this logic when the modal opens

    const refreshData = () => {
        window.location.reload(); 
    };

    const handleTypeSelect = (type: 'SHARED_RENTAL' | 'PERSONAL_DUE') => {
        setCategory(type);
        setStep(2);
    };

    const handleClose = () => {
        setStep(1); setCategory(null); setName(''); setAmount('');
        setIsRecurring(false); setDueDay(''); setError(null); onClose();
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        if (!selectedMonth) {
        setError("Please select a valid month.");
        setIsLoading(false);
        return;
    }

        const expenseDate = new Date(selectedMonth); // Default: create for the *currently viewed* month
        
        if (initialData) {
            // This is a RENEWAL, so we create it for the *next* month
            // (e.g., if viewing Nov, this creates it for Dec)
            expenseDate.setMonth(expenseDate.getMonth() + 1);
        }
        const payload = {
            name,
            amount: parseFloat(amount),
            category,
            date: expenseDate.toISOString(),
            is_recurring: isRecurring,
            due_day_of_month: isRecurring ? parseInt(dueDay) : null,
        };
        
        if (isRecurring && (!dueDay || parseInt(dueDay) < 1 || parseInt(dueDay) > 28)) {
            setError("Recurring day must be between 1 and 28.");
            setIsLoading(false);
            return;
        }
        
        const csrftoken = getCookie('csrftoken') || '';

        try {
            const res = await fetch(`${API_BASE_BACKEND}/api/expenses/`, {
                method: 'POST',
                credentials : 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                 if (res.status === 403) {
                     const errData = await res.json();
                     throw new Error(errData.detail || "CSRF check failed or not authenticated.");
                }
                const errData = await res.json();
                const errMessage = Object.entries(errData)
                    .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                    .join(' ');
                throw new Error(errMessage || "An unknown error occurred.");
            }

            handleClose();
            refreshData();
            
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message);
            } else {
                setError("An error occured during handle submit for expense cards");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                {step === 1 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={() => handleTypeSelect('SHARED_RENTAL')}
                                className="w-full text-left p-4 bg-blue-100 hover:bg-blue-200 rounded-lg"
                            >
                                <h3 className="text-lg font-bold text-blue-800">Shared Rental</h3>
                                <p className="text-sm text-blue-600">For house items, bills, etc.</p>
                            </button>
                            <button
                                onClick={() => handleTypeSelect('PERSONAL_DUE')}
                                className="w-full text-left p-4 bg-purple-100 hover:bg-purple-200 rounded-lg"
                            >
                                <h3 className="text-lg font-bold text-purple-800">Personal Due</h3>
                                <p className="text-sm text-purple-600">For your private expenses.</p>
                            </button>
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-6">
                            Add {category === 'SHARED_RENTAL' ? 'Shared Rental' : 'Personal Due'}
                        </h2>
                        {error && <div className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</div>}
                        
                        {/* ... (rest of form is unchanged) ... */}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 text-lime-600 border-gray-300 rounded"
                            />
                            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                                Is this a recurring expense?
                            </label>
                        </div>
                        
                        {isRecurring && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Day of Month (1-28)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="28"
                                    value={dueDay}
                                    onChange={(e) => setDueDay(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                    required={isRecurring}
                                />
                            </div>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="py-2 px-4 bg-lime-600 text-white rounded-lg hover:bg-lime-700 disabled:bg-gray-400"
                            >
                                {isLoading ? 'Saving...' : 'Save Expense'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};