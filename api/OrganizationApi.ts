import {api} from "@/libs/axios";
import {Organization} from "@/types/organization";


export const OrganizationApi = {
    createOrganization: (body: Organization) => api.post('/organizations', body)
}