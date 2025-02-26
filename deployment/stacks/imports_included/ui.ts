import { Construct } from "constructs";
import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontOrigins,
} from "aws-cdk-lib";

interface CreateUiComponentsProps {
  scope: Construct;
}

export function createUiComponents(props: CreateUiComponentsProps) {
  const {
    scope,
  } = props;

  new cloudfront.Distribution(
    scope,
    'CloudFrontDistribution',
    {
      defaultBehavior: {
        origin: new cloudfrontOrigins.HttpOrigin(
          'www.example.com',
          { originId: 'Default'}
        ),
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
    }
  );
}
