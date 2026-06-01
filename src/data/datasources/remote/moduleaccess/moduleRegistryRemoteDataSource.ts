import { API_ENDPOINTS } from "@/common/config/api-endpoints";
import { extractApiData } from "@/domain/models/common";
import {
  parseModuleRegistryEntry,
  type ModuleRegistryEntry,
} from "@/domain/models/module-registry";
import { apiFetch } from "@/lib/api/client";

export const moduleRegistryRemoteDataSource = {
  async listRegistry(): Promise<ModuleRegistryEntry[]> {
    const response = await apiFetch<unknown>(API_ENDPOINTS.SUPER_ADMIN.MODULE_REGISTRY);
    const data = extractApiData<unknown[]>(response);
    return data.map(parseModuleRegistryEntry);
  },
};
