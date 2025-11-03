import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useThread from '@/hooks/use-thread';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';
import Select from 'react-select'
import makeAnimated from 'react-select/animated';

type Props = {
    placeholder: string;
    label: string;
    onChange: (values: { label: string, value: string }[]) => void;
    value?: {
        label: string,
        value: string,
    }[]
}

const TagInput = ({ placeholder, label, onChange, value }: Props) => {
    const { accountId } = useThread();
    const [inputValue, setInputValue] = useState<string>('');
    
    // Only call API if accountId exists
    const { data: suggestionsData } = api.account.getSuggestions.useQuery({
        accountId: accountId || ''
    }, {
        enabled: !!accountId, // Only run query if accountId exists
    });
    
    const animatedComponents = makeAnimated();
    
    const options = suggestionsData?.map(suggestionData => ({
        label: (
            <span className='flex items-center gap-2'>
                <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-primary bg-primary/10 text-xs">
                        {suggestionData.name?.split(' ').map(chunk => chunk[0]).join('').slice(0, 2).toUpperCase() ?? 
                        suggestionData.address.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span>{suggestionData.address}</span>
            </span>
        ),
        value: suggestionData.address,
    })) ?? []

    // Auto-scroll to bottom when value changes
    useEffect(() => {
        if (value && value.length > 0) {
            setTimeout(() => {
                const container = document.querySelector('.select__value-container');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }, 0);
        }
    }, [value]);

    return (
        <div className="border rounded-md flex items-center min-h-[42px]">
            <span className='ml-3 text-sm text-gray-500 shrink-0'>
                {label}
            </span>
            <Select
                value={value}
                onInputChange={setInputValue}
                onChange={(newValue) => {
                    onChange([...newValue]);
                    setTimeout(() => {
                        const container = document.querySelector('.select__value-container');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }, 0);
                }}
                    options={inputValue ? [...options, {
                    label: <span>{inputValue}</span>,
                    value: inputValue
                }] : options}
                placeholder={placeholder}
                isMulti
                components={animatedComponents}
                className='w-full flex-1'
                classNames={{
                    control: () => {
                        return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent !min-h-0'
                    },
                    valueContainer: () => {
                        return '!max-h-[120px] !overflow-y-auto !py-1'
                    },
                    multiValue: () => {
                        return '!rounded-full !m-1'
                    },
                    multiValueLabel: () => {
                        return '!rounded-full !text-xs !px-2'
                    },
                    multiValueRemove: () => {
                        return 'hover:!text-destructive-foreground hover:!bg-destructive/10 !rounded-full'
                    }
                }}
                styles={{
                    valueContainer: (base) => ({
                        ...base,
                        maxHeight: '120px',
                        overflowY: 'auto',
                        padding: '4px 8px',
                        scrollBehavior: 'smooth',
                    }),
                }}
                classNamePrefix="select"
            />
        </div>
    )
}

export default TagInput