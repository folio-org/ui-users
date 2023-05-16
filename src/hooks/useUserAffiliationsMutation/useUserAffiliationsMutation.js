import { chunk, uniqBy } from 'lodash';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { uniqBy } from 'lodash';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
  OKAPI_TENANT_HEADER,
} from '../../constants';
import { getResponseErrors } from '../../components/UserDetailSections/UserAffiliations/util';

const CHUNK_SIZE = 5;

const batchRequest = async (arr, handler) => (
  chunk(arr, CHUNK_SIZE)
    .reduce(async (prevPromise, itemsChunk) => {
      const prevSettled = await prevPromise;

      return prevSettled.concat(
        await Promise.allSettled(itemsChunk.map(item => {
          return handler(item);
        })),
      );
    }, Promise.resolve([]))
);

const useUserAffiliationsMutation = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();

  const consortium = stripes?.user?.user?.consortium;

  const {
    mutateAsync: assignAffiliation,
    isLoading: isAssigningLoading,
  } = useMutation({
    mutationFn: ({ tenantId, userId }) => {
      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenantId);
            },
          ],
        },
      });

      return api.post(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { json: { tenantId, userId } },
      );
    },
  });

  const {
    mutateAsync: unassignAffiliation,
    isLoading: isUnassigningLoading,
  } = useMutation({
    mutationFn: ({ tenantId, userId }) => {
      const api = ky.extend({
        hooks: {
          beforeRequest: [
            request => {
              request.headers.set(OKAPI_TENANT_HEADER, consortium.centralTenantId);
            },
          ],
        },
      });

      return api.delete(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { searchParams: { tenantId, userId } },
      );
    },
  });

  const handleAssignment = useCallback(async ({ added, removed }) => {
    const batchResponses = await Promise.allSettled([
      batchRequest(added, assignAffiliation),
      batchRequest(removed, unassignAffiliation),
    ]);

    const errors = await getResponseErrors(batchResponses);
    const uniqueErrorMessages = uniqBy(errors, 'message');
    if (uniqueErrorMessages.length) {
      return {
        errors: uniqueErrorMessages,
        success: false,
        responses: batchResponses,
      };
    }

    return {
      errors: [],
      success: true,
      responses: batchResponses,
    };
  }, [assignAffiliation, unassignAffiliation]);

  const isLoading = isAssigningLoading || isUnassigningLoading;

  return {
    assignAffiliation,
    handleAssignment,
    unassignAffiliation,
    isLoading,
  };
};

export default useUserAffiliationsMutation;
