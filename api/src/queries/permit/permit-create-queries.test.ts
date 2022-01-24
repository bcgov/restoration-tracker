import { expect } from 'chai';
import { describe } from 'mocha';
import { postProjectPermitSQL } from './permit-create-queries';

describe('postProjectPermitSQL', () => {
  it('returns null when no permit number', () => {
    const response = postProjectPermitSQL((null as unknown) as string, 'type', 1, 1);

    expect(response).to.be.null;
  });

  it('returns null when no permit type', () => {
    const response = postProjectPermitSQL('123', (null as unknown) as string, 1, 1);

    expect(response).to.be.null;
  });

  it('returns null when no project id', () => {
    const response = postProjectPermitSQL('123', 'type', (null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when no system user id', () => {
    const response = postProjectPermitSQL('123', 'type', 1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when all fields are passed in as expected', () => {
    const response = postProjectPermitSQL('123', 'type', 123, 2);

    expect(response).to.not.be.null;
    expect(response?.values).to.deep.include('123');
  });
});
