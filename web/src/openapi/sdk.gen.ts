// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from '@hey-api/client-fetch';
import type { GetAuthData, GetAuthResponse, GetProfileData, GetProfileResponse, PostProfileData, PostProfileResponse, GetProfileAgreementsData, GetProfileAgreementsResponse, PostProfileAgreementsData, PostProfileAgreementsResponse, PostProfileTrainingData, PostProfileTrainingResponse, GetAgreementsApprovedResearcherData, GetAgreementsApprovedResearcherResponse } from './types.gen';
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
    return (options?.client ?? _heyApiClient).get<GetAuthResponse, unknown, ThrowOnError>({
        url: '/auth',
        ...options
    });
};

/**
 * Users profile
 */
export const getProfile = <ThrowOnError extends boolean = false>(options?: Options<GetProfileData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProfileResponse, unknown, ThrowOnError>({
        url: '/profile',
        ...options
    });
};

export const postProfile = <ThrowOnError extends boolean = false>(options: Options<PostProfileData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileResponse, unknown, ThrowOnError>({
        url: '/profile',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get all the agreements a user has agreed to
 */
export const getProfileAgreements = <ThrowOnError extends boolean = false>(options?: Options<GetProfileAgreementsData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetProfileAgreementsResponse, unknown, ThrowOnError>({
        url: '/profile/agreements',
        ...options
    });
};

/**
 * Update the agreements for a user
 */
export const postProfileAgreements = <ThrowOnError extends boolean = false>(options: Options<PostProfileAgreementsData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileAgreementsResponse, unknown, ThrowOnError>({
        url: '/profile/agreements',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Update the training record for a user
 */
export const postProfileTraining = <ThrowOnError extends boolean = false>(options: Options<PostProfileTrainingData, ThrowOnError>) => {
    return (options.client ?? _heyApiClient).post<PostProfileTrainingResponse, unknown, ThrowOnError>({
        url: '/profile/training',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
};

/**
 * Get the latest approved researcher agreement
 */
export const getAgreementsApprovedResearcher = <ThrowOnError extends boolean = false>(options?: Options<GetAgreementsApprovedResearcherData, ThrowOnError>) => {
    return (options?.client ?? _heyApiClient).get<GetAgreementsApprovedResearcherResponse, unknown, ThrowOnError>({
        url: '/agreements/approved-researcher',
        ...options
    });
};