// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from './client';
import type { GetAuthData, GetAuthResponses, GetAuthErrors, GetProfileData, GetProfileResponses, GetProfileErrors, PostProfileData, PostProfileResponses, PostProfileErrors, GetProfileAgreementsData, GetProfileAgreementsResponses, GetProfileAgreementsErrors, PostProfileAgreementsData, PostProfileAgreementsResponses, PostProfileAgreementsErrors, GetProfileTrainingData, GetProfileTrainingResponses, GetProfileTrainingErrors, PostProfileTrainingData, PostProfileTrainingResponses, PostProfileTrainingErrors, GetAgreementsApprovedResearcherData, GetAgreementsApprovedResearcherResponses, GetAgreementsApprovedResearcherErrors, GetPeopleData, GetPeopleResponses, GetPeopleErrors, PostPeopleByIdData, PostPeopleByIdResponses, PostPeopleByIdErrors, PostPeopleApprovedResearchersImportCsvData, PostPeopleApprovedResearchersImportCsvResponses, PostPeopleApprovedResearchersImportCsvErrors } from './types.gen';
import { client as _heyApiClient } from './client.gen';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<TData, ThrowOnError> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: Record<string, unknown>;
};

/**
 * Authentication and authorization status of the user
 */
export const getAuth = <ThrowOnError extends boolean = false>(options?: Options<GetAuthData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetAuthResponses, GetAuthErrors, ThrowOnError>({
        url: '/auth',
        ...options
    });
};

/**
 * Users profile
 */
export const getProfile = <ThrowOnError extends boolean = false>(options?: Options<GetProfileData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProfileResponses, GetProfileErrors, ThrowOnError>({
        url: '/profile',
        ...options
    });
};

export const postProfile = <ThrowOnError extends boolean = false>(options: Options<PostProfileData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileResponses, PostProfileErrors, ThrowOnError>({
        url: '/profile',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get all the agreements a user has agreed to
 */
export const getProfileAgreements = <ThrowOnError extends boolean = false>(options?: Options<GetProfileAgreementsData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProfileAgreementsResponses, GetProfileAgreementsErrors, ThrowOnError>({
        url: '/profile/agreements',
        ...options
    });
};

/**
 * Update the agreements for a user
 */
export const postProfileAgreements = <ThrowOnError extends boolean = false>(options: Options<PostProfileAgreementsData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileAgreementsResponses, PostProfileAgreementsErrors, ThrowOnError>({
        url: '/profile/agreements',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get the training record status for a user
 */
export const getProfileTraining = <ThrowOnError extends boolean = false>(options?: Options<GetProfileTrainingData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProfileTrainingResponses, GetProfileTrainingErrors, ThrowOnError>({
        url: '/profile/training',
        ...options
    });
};

/**
 * Update the training record for a user
 */
export const postProfileTraining = <ThrowOnError extends boolean = false>(options: Options<PostProfileTrainingData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileTrainingResponses, PostProfileTrainingErrors, ThrowOnError>({
        url: '/profile/training',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Get the latest approved researcher agreement
 */
export const getAgreementsApprovedResearcher = <ThrowOnError extends boolean = false>(options?: Options<GetAgreementsApprovedResearcherData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetAgreementsApprovedResearcherResponses, GetAgreementsApprovedResearcherErrors, ThrowOnError>({
        url: '/agreements/approved-researcher',
        ...options
    });
};

/**
 * Get all the people a user has access to
 */
export const getPeople = <ThrowOnError extends boolean = false>(options?: Options<GetPeopleData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetPeopleResponses, GetPeopleErrors, ThrowOnError>({
        url: '/people',
        ...options
    });
};

export const postPeopleById = <ThrowOnError extends boolean = false>(options: Options<PostPeopleByIdData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostPeopleByIdResponses, PostPeopleByIdErrors, ThrowOnError>({
        url: '/people/{id}',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

/**
 * Upload a CSV file with fields
 * <username: string, e.g. "bob@example.com">,
 * <agreed to agreement: bool, e.g. true>,
 * <NHSD training completed at date: string, e.g. 2021-03-11>
 *
 */
export const postPeopleApprovedResearchersImportCsv = <ThrowOnError extends boolean = false>(options: Options<PostPeopleApprovedResearchersImportCsvData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostPeopleApprovedResearchersImportCsvResponses, PostPeopleApprovedResearchersImportCsvErrors, ThrowOnError>({
        bodySerializer: null,
        url: '/people/approved-researchers/import/csv',
        ...options,
        headers: {
            'Content-Type': 'text/csv',
            ...options.headers
        }
    });
};