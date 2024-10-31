import express from 'express';
import {Provider, Wallet, ScriptTransactionRequest, Signer} from 'fuels';

const app = express();
const port = 3456;

app.use(express.json());

app.post('/create-transaction', async (req: express.Request, res: express.Response) => {
    try {
        const {fromAddress, receiverAddress, assetId, amount, url} = req.body;

        if (!fromAddress || !receiverAddress || !assetId || !amount || !url) {
            return res.json({code: 1, message: '缺少必要参数'});
        }

        const provider = await Provider.create(url);

        const senderWallet = Wallet.fromAddress(fromAddress, provider);

        const txRequest = await senderWallet.createTransfer(receiverAddress, amount, assetId);
        const transactionId = txRequest.getTransactionId(provider.getChainId());
        const transactionBytes = txRequest.toTransactionBytes();
        const rawTransaction = Array.from(transactionBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');

        res.json({
            code: 0,
            message: 'success',
            data: {
                txHash: `${transactionId}`,
                raw: `0x${rawTransaction}`
            }
        });
    } catch (error) {
        const errCode = (error as any).code;
        console.error('构建交易出错:', error);
        res.json({code: 1, message: `构建交易出错: ${errCode}`});
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});