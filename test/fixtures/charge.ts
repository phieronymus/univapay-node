import uuid from 'uuid';
import { ProcessingMode } from '../../src/resources/common/enums';
import { ChargeItem, ChargeStatus } from '../../src/resources/Charges';
import { TransactionTokenType } from '../../src/resources/TransactionTokens';

export function generateFixture(): ChargeItem {
    return {
        id: uuid(),
        merchantId: uuid(),
        storeId: uuid(),
        transactionTokenId: uuid(),
        transactionTokenType: TransactionTokenType.ONE_TIME,
        subscriptionId: uuid(),
        requestedAmount: 1000,
        requestedCurrency: 'JPY',
        requestedAmountFormatted: 1000,
        chargedAmount: 1000,
        chargedCurrency: 'JPY',
        chargedAmountFormatted: 1000,
        captureAt: new Date().toISOString(),
        status: ChargeStatus.SUCCESSFUL,
        metadata: {},
        mode: ProcessingMode.TEST,
        createdOn: new Date().toISOString(),
        descriptor: 'test',
        onlyDirectCurrency: false,
    };
}
