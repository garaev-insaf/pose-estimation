import { IQueryOptions } from "@shared/types/services.ts";
import { useQuery } from "@tanstack/react-query";
import { customApi } from "../../../lib/api";
import { IClipsLogs } from "./type";

export const useGetClips = (options?: IQueryOptions<IClipsLogs[]>) =>
	useQuery({
		queryKey: ["get-clips"],
		queryFn: async (): Promise<IClipsLogs[]> => customApi.get("/clips"),
		...options,
	});
