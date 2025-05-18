import { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export type BasicResponseErrorType = AxiosError<{
    detail?: string;
    errors?: { field: string; code: string }[];
    error?: string;
    non_field_errors?: string[];
}>;

export type IQueryOptions<T> = Omit<UseQueryOptions<T, BasicResponseErrorType>, 'queryKey' | 'queryFn'>;

export type IMutationOptions<T, D = void> = Omit<
    UseMutationOptions<T, BasicResponseErrorType, D>,
    'mutationKey' | 'mutationFn'
>;
