import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import uuid from 'uuid';
import { testEndpoint } from '../utils';
import { pathToRegexMatcher } from '../utils/routes';
import { BankAccounts } from '../../src/resources';
import { BankAccountType, BankAccountCreateParams, BankAccountUpdateParams } from '../../src/resources/BankAccounts';
import { RestAPI } from '../../src/api/RestAPI';
import { generateList } from '../fixtures/list';
import { generateFixture as generateBankAccount } from '../fixtures/bank-account';
import { RequestError } from '../../src/errors/RequestResponseError';
import { createRequestError } from '../fixtures/errors';

describe('Bank Accounts', function() {
    let api: RestAPI;
    let bankAccounts: BankAccounts;

    const recordBasePathMatcher = `${testEndpoint}/bank_accounts`;
    const recordPathMatcher = pathToRegexMatcher(`${testEndpoint}/bank_accounts/:id`);
    const recordData = generateBankAccount();

    beforeEach(function() {
        api = new RestAPI({ endpoint: testEndpoint });
        bankAccounts = new BankAccounts(api);
    });

    afterEach(function() {
        fetchMock.restore();
    });

    context('POST /bank_accounts', function() {
        it('should get response', async function() {
            fetchMock.postOnce(recordBasePathMatcher, {
                status: 201,
                body: recordData,
                headers: { 'Content-Type': 'application/json' },
            });

            const data: BankAccountCreateParams = {
                accountNumber: '1234567890',
                country: 'JP',
                currency: 'JPY',
                holderName: 'Joe Doe',
                bankName: 'Bank',
                branchName: 'Branch',
                bankAddress: 'Address',
                swiftCode: 'FAKECODE',
                accountType: BankAccountType.CHECKING,
            };

            await expect(bankAccounts.create(data)).to.eventually.eql(recordData);
        });

        it('should return validation error if data is invalid', async function() {
            const asserts: [Partial<BankAccountCreateParams>, RequestError][] = [
                [{}, createRequestError(['accountNumber'])],
                [{ accountNumber: '' }, createRequestError(['country'])],
                [{ accountNumber: '', country: 'JP' }, createRequestError(['currency'])],
                [{ accountNumber: '', country: 'JP', currency: 'JPY' }, createRequestError(['holderName'])],
                [
                    { accountNumber: '', country: 'JP', currency: 'JPY', holderName: 'Joe' },
                    createRequestError(['bankName']),
                ],
            ];

            for (const [data, error] of asserts) {
                await expect(bankAccounts.create(data as BankAccountCreateParams))
                    .to.eventually.be.rejectedWith(RequestError)
                    .that.has.property('errorResponse')
                    .which.eql(error.errorResponse);
            }
        });
    });

    context('GET /bank_accounts', function() {
        it('should get response', async function() {
            const listData = generateList({
                count: 10,
                recordGenerator: generateBankAccount,
            });

            fetchMock.get(recordBasePathMatcher, {
                status: 200,
                body: listData,
                headers: { 'Content-Type': 'application/json' },
            });

            await expect(bankAccounts.list()).to.eventually.eql(listData);
        });
    });

    context('GET /bank_accounts/:id', function() {
        it('should get response', async function() {
            fetchMock.getOnce(recordPathMatcher, {
                status: 200,
                body: recordData,
                headers: { 'Content-Type': 'application/json' },
            });

            await expect(bankAccounts.get(uuid())).to.eventually.eql(recordData);
        });
    });

    context('GET /bank_accounts/primary', function() {
        it('should get response', async function() {
            fetchMock.getOnce(`${recordBasePathMatcher}/primary`, {
                status: 200,
                body: recordData,
                headers: { 'Content-Type': 'application/json' },
            });

            await expect(bankAccounts.getPrimary()).to.eventually.eql(recordData);
        });
    });

    context('PATCH /bank_accounts/:id', function() {
        it('should get response', async function() {
            fetchMock.patchOnce(recordPathMatcher, {
                status: 200,
                body: recordData,
                headers: { 'Content-Type': 'application/json' },
            });

            const data: BankAccountUpdateParams = {
                accountNumber: '1234567890',
                country: 'JP',
                currency: 'JPY',
                holderName: 'Joe Doe',
                bankName: 'Bank',
                branchName: 'Branch',
                bankAddress: 'Address',
                swiftCode: 'FAKECODE',
                accountType: BankAccountType.CHECKING,
            };

            await expect(bankAccounts.update(uuid(), data)).to.eventually.eql(recordData);
        });
    });

    context('DELETE /bank_accounts/:id', function() {
        it('should get response', async function() {
            fetchMock.deleteOnce(recordPathMatcher, {
                status: 204,
                headers: { 'Content-Type': 'application/json' },
            });

            await expect(bankAccounts.delete(uuid())).to.eventually.be.empty;
        });
    });

    it('should return request error when parameters for route are invalid', async function() {
        const errorId = createRequestError(['id']);

        const asserts: [Promise<any>, RequestError][] = [
            [bankAccounts.get(null), errorId],
            [bankAccounts.update(null), errorId],
            [bankAccounts.delete(null), errorId],
        ];

        for (const [request, error] of asserts) {
            await expect(request)
                .to.eventually.be.rejectedWith(RequestError)
                .that.has.property('errorResponse')
                .which.eql(error.errorResponse);
        }
    });
});
