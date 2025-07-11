import MetaHead from "@/components/meta/Head";
import Title from "@/components/ui/Title";
import { storageDefinitions } from "@/components/shared/storageDefinitions";

import styles from "./definitions.module.css";

export default function AssetDefinitionsPage() {
  return (
    <>
      <MetaHead
        title="Asset Storage Definitions | ARC Services Portal"
        description="Definitions and security requirements for asset storage locations and touchpoints"
      />

      <div className={styles.container}>
        <Title text="Asset Storage Definitions" />

        <div className={styles.intro}>
          <p>
            This page contains definitions and security requirements for all storage locations and touchpoints that may
            be relevant when creating data assets. Please review these definitions carefully to understand the security
            implications of each storage option.
          </p>
        </div>

        <div className={styles.definitions}>
          {storageDefinitions.map((item, index) => (
            <div key={index} className={styles.definition}>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.description}>{item.definition}</p>
              {item.links && (
                <div className={styles.links}>
                  {item.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p>
            For additional guidance or questions about data storage security, contact{" "}
            <a href="mailto:infogov@ucl.ac.uk">IG Advisory (infogov@ucl.ac.uk)</a>.
          </p>
        </div>
      </div>
    </>
  );
}
