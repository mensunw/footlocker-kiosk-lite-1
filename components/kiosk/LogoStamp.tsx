import Image from 'next/image';
import styles from './LogoStamp.module.css';

interface LogoStampProps {
  variant?: 'V1' | 'V2';
  className?: string;
  showOptiSigns?: boolean;
}

export default function LogoStamp({
  variant = 'V1',
  className = '',
  showOptiSigns = true
}: LogoStampProps) {
  return (
    <div className={`${styles.logoStamp} ${styles[`variant${variant}`]} ${className}`}>
      <div className={styles.footlockerLogo}>
        <Image
          src="/assets/footlocker/footlocker-logo.svg"
          alt="Foot Locker"
          width={280}
          height={84}
          priority
        />
      </div>
      {showOptiSigns && (
        <div className={styles.optisignsLogo}>
          <Image
            src="/assets/optisigns/optisigns-logo.svg"
            alt="OptiSigns"
            width={120}
            height={30}
            priority
          />
        </div>
      )}
    </div>
  );
}