import * as React from "react";
import Icon from "../../../../icons";
const styles = require("./wallet.scss");

export interface IAbstractProps {
  walletAddress: string;
  tokenBalance: number;
  transactions?: { id: number; name: string }[];
}

const Abstract = (props: IAbstractProps) => {
  return (
    <div>
      <div className={styles.walletInformationTitle}>Wallet Information</div>
      <div className={styles.walletInformation}>
        <Icon className={styles.bitmapIconWrapper} icon="AVATAR" />
        <div className={styles.addressAndBalance}>
          <div className={styles.walletAddressTitle}>wallet address</div>
          <div className={styles.walletAddressContent}>{props.walletAddress}</div>
          <div className={styles.tokenBalanceTitle}>token Balance</div>
          <div className={styles.tokenBalanceContent}>{`${props.tokenBalance} PLT`}</div>
        </div>
        <div className={styles.copyBtn}>Copy</div>
      </div>
      <div className={styles.separatorLine} />
      <div className={styles.transactionHistory}>
        <div className={styles.transactionTitle}>transaction History</div>
      </div>
    </div>
  );
};

export default Abstract;
