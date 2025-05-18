import { IQueryOptions } from "@shared/types/services.ts";
import { useQuery } from "@tanstack/react-query";
import { customApi } from "../../../lib/api";
import { ICamera } from "./type";
import { IMutationOptionsCustom, useMutationCustom } from "@shared/hooks/use-custom-mutation";

export const useGetCameras = (options?: IQueryOptions<ICamera[]>) =>
	useQuery({
		queryKey: ["get-cameras"],
		queryFn: async (): Promise<ICamera[]> => customApi.get("/cameras"),
		...options,
	});

export const useGetCameraStream = (id: number, options?: IQueryOptions<string>) =>
	useQuery({
		queryKey: ["get-camera-stream"],
		queryFn: async (): Promise<string> => customApi.get(`/stream/${id}`),
		...options,
	});

export const useCreateCamera = (
	options?: IMutationOptionsCustom<ICamera, { name: string; source: string }>
) =>
	useMutationCustom({
		mutationKey: ["post-cameras"],

		mutationFn: async (body): Promise<ICamera> =>
			customApi.post("/cameras", {
				body,
			}),
		...options,
	});

// export const useCreateCamera = (
// 	options?: IQueryOptions<IClipsLogs[]>,
// 	body: { name: string; source: string }
// ) =>
// 	useMutationCustom({
// 		mutationKey: ["post-cameras"],
// 		mutationFn: async (body: { name: string; source: string }): Promise<IClipsLogs[]> =>
// 			customApi.post("/cameras", {
// 				body,
// 			}),
// 		...options,
// 	});
