import { queryClient } from "@shared/api/query-client";
import { BasicResponseErrorType } from "@shared/types/services";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export interface IMutationOptionsCustom<T, D>
	extends UseMutationOptions<T, BasicResponseErrorType, D> {
	keysOnError?: string[];
	keysOnSuccess?: string[];
}

export const useMutationCustom = <T, D>(options: IMutationOptionsCustom<T, D>) => {
	const { onError, onSuccess, keysOnError, keysOnSuccess, ...other } = options;

	return useMutation({
		...other,
		onSuccess: (...args) => {
			if (keysOnSuccess?.length) {
				keysOnSuccess.forEach((key) =>
					queryClient.invalidateQueries({ queryKey: [key], exact: false })
				);
			}

			if (onSuccess) onSuccess(...args);
		},

		onError: (...args) => {
			if (keysOnError?.length) {
				queryClient.invalidateQueries({ queryKey: [...keysOnError] });
			}

			if (onError) onError(...args);
		},
	});
};
