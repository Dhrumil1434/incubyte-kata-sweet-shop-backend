import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureUniqueEmail } from '../user.validators';
import * as repo from '../user.repository';
import { ApiError } from '../../../utils';

describe('user.validators', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when email missing', async () => {
    await expect(ensureUniqueEmail('')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws when email is taken', async () => {
    vi.spyOn(repo.userRepository, 'isEmailTaken').mockResolvedValue(true);
    await expect(ensureUniqueEmail('taken@example.com')).rejects.toBeInstanceOf(
      ApiError
    );
  });

  it('passes when email is free', async () => {
    vi.spyOn(repo.userRepository, 'isEmailTaken').mockResolvedValue(false);
    await expect(
      ensureUniqueEmail('free@example.com')
    ).resolves.toBeUndefined();
  });
});
