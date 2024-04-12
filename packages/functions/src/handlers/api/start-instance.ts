import {
  DescribeLaunchTemplateVersionsCommand,
  EC2Client,
  LaunchTemplateTagSpecification,
  RunInstancesCommand,
  RunInstancesCommandInput,
} from '@aws-sdk/client-ec2';
import { SecureHandler } from 'src/utils/handlerUtils';

const client = new EC2Client({});

const TEXT_PLAIN = { 'Content-Type': 'text/plain' };

export const handler = SecureHandler(async event => {
  try {
    if (event.body === undefined) {
      throw new Error('Missing parameters');
    }
    const request = JSON.parse(event.body);

    const launchTemplateId = request.instanceId;
    const name = request.title;
    const { owner, costCenter, schedule } = request;

    // retrieve launchTemplate to extract imageId, instanceType, keyName and securityGroupIds
    const launchTemplate = await client.send(
      new DescribeLaunchTemplateVersionsCommand({
        LaunchTemplateId: launchTemplateId,
        Versions: ['$Latest'],
      })
    );
    const launchTemplateData = launchTemplate.LaunchTemplateVersions?.[0].LaunchTemplateData;

    const instanceTags =
      launchTemplateData?.TagSpecifications?.find(
        (tag: LaunchTemplateTagSpecification) => tag.ResourceType === 'instance'
      )?.Tags || [];

    const volumeTags =
      launchTemplateData?.TagSpecifications?.find(
        (tag: LaunchTemplateTagSpecification) => tag.ResourceType === 'volume'
      )?.Tags || [];

    const tags = [
      {
        Key: 'Name',
        Value: name,
      },
      {
        Key: 'Ec2LeaserDuration',
        Value: '6',
      },
      {
        Key: 'costcenter',
        Value: costCenter,
      },
      {
        Key: 'owner',
        Value: owner,
      },
      {
        Key: 'schedule',
        Value: schedule,
      },
    ];

    const params: RunInstancesCommandInput = {
      MaxCount: 1,
      MinCount: 1,
      ImageId: launchTemplateData?.ImageId,
      InstanceType: launchTemplateData?.InstanceType,
      KeyName: launchTemplateData?.KeyName,
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [...tags, ...instanceTags],
        },
        {
          ResourceType: 'volume',
          Tags: [...tags, ...volumeTags],
        },
      ],
      MetadataOptions: {
        HttpEndpoint: 'enabled',
        HttpTokens: 'required',
      },
      NetworkInterfaces: [
        {
          DeviceIndex: 0,
          AssociatePublicIpAddress: false,
          Groups: launchTemplateData?.SecurityGroupIds,
        },
      ],
    };

    const data = await client.send(new RunInstancesCommand(params));

    if (!data?.Instances || data?.Instances.length === 0) {
      throw new Error('Wrong result from the EC2 API');
    }

    return {
      statusCode: 200,
      headers: TEXT_PLAIN,
      body: JSON.stringify({
        instanceId: data.Instances[0].InstanceId,
        privateIp: data.Instances[0].PrivateIpAddress,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: TEXT_PLAIN,
      body: (error as Error).message,
    };
  }
});
