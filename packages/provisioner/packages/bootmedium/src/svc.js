const Db = require("moleculer-db");
const Adapter = require("moleculer-db-adapter-sequelize");
const Orm = require("sequelize");

module.exports = {
  name: "bootmedium",
  actions: {
    createOverwrite: {
      params: {
        script: "string",
        label: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing bootmedium subartifacts creation",
          ctx.params
        );
        const { id: ipxeUefiId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin-x86_64-efi",
            driver: "ipxe",
            extension: "efi"
          }
        );
        const { id: ipxeBiosId } = await ctx.call(
          "ipxe-manager.createOverwrite",
          {
            script: ctx.params.script,
            platform: "bin",
            driver: "ipxe",
            extension: "lkrn"
          }
        );
        const { id: grubImgId } = await ctx.call(
          "grub-manager.createOverwrite",
          {
            label: ctx.params.label,
            platform: "x86_64-efi",
            architecture: "x86",
            extension: "efi",
            fragment: "img"
          }
        );
        const { id: grubEfiId } = await ctx.call(
          "grub-manager.createOverwrite",
          {
            label: ctx.params.label,
            platform: "x86_64-efi",
            architecture: "x86",
            extension: "efi",
            fragment: "efi"
          }
        );
        const { id: ldLinuxId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "ldlinux.c32"
          }
        );
        const { id: isolinuxBinId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "isolinux.bin"
          }
        );
        const { id: isohdpfxBinId } = await ctx.call(
          "syslinux-manager.createOverwrite",
          {
            fragment: "isohdpfx.bin"
          }
        );
        const bootmedium = await ctx.call("bootmedium.create", {
          ...ctx.params,
          ipxeUefiId,
          ipxeBiosId,
          grubImgId,
          grubEfiId,
          ldLinuxId,
          isolinuxBinId,
          isohdpfxBinId,
          isoId: 0
        });
        return bootmedium;
      }
    },
    createIso: {
      params: {
        id: "string"
      },
      handler: async function(ctx) {
        await this.logger.info(
          "Queueing bootmedium iso subartifact creation",
          ctx.params
        );
        const {
          label,
          ipxeUefiId,
          ipxeBiosId,
          grubImgId,
          grubEfiId,
          ldLinuxId,
          isolinuxBinId,
          isohdpfxBinId
        } = await ctx.call("bootmedium.get", { id: ctx.params.id });
        const { artifactId: ipxeUefiArtifactId } = await ctx.call(
          "ipxe-manager.get",
          {
            id: ipxeUefiId
          }
        );
        const { artifactId: ipxeBiosArtifactId } = await ctx.call(
          "ipxe-manager.get",
          {
            id: ipxeBiosId
          }
        );
        const { artifactId: grubImgArtifactId } = await ctx.call(
          "grub-manager.get",
          {
            id: grubImgId
          }
        );
        const { artifactId: grubEfiArtifactId } = await ctx.call(
          "grub-manager.get",
          {
            id: grubEfiId
          }
        );
        const { artifactId: ldLinuxArtifactId } = await ctx.call(
          "syslinux-manager.get",
          {
            id: ldLinuxId
          }
        );
        const { artifactId: isolinuxBinArtifactId } = await ctx.call(
          "syslinux-manager.get",
          {
            id: isolinuxBinId
          }
        );
        const { artifactId: isohdpfxBinArtifactId } = await ctx.call(
          "syslinux-manager.get",
          {
            id: isohdpfxBinId
          }
        );
        const { id: isoId } = await ctx.call("iso-manager.createOverwrite", {
          label,
          ipxeUefiUrl: `http://minio/ixpes/${ipxeUefiArtifactId}/ipxe.efi`,
          ipxeBiosUrl: `http://minio/ixpes/${ipxeBiosArtifactId}/ipxe.lkrn`,
          grubImgUrl: `http://minio/grub/${grubImgArtifactId}/grub.img`,
          grubEfiUrl: `http://minio/grub/${grubEfiArtifactId}/grub.zip`,
          ldLinuxUrl: `http://minio/syslinuxs/${ldLinuxArtifactId}/ldlinux.c32`,
          isolinuxBinUrl: `http://minio/syslinuxs/${isolinuxBinArtifactId}/isolinux.bin`,
          isohdpfxBinUrl: `http://minio/syslinuxs/${isohdpfxBinArtifactId}/isolinux.bin`
        });
        return await ctx.call("bootmedium.update", {
          id: ctx.params.id,
          isoId
        });
      }
    }
  },
  mixins: [Db],
  adapter: new Adapter(process.env.POSTGRES_URI),
  model: {
    name: "bootmedium",
    define: {
      script: Orm.STRING,
      label: Orm.STRING,
      ipxeUefiId: Orm.INTEGER,
      ipxeBiosId: Orm.INTEGER,
      grubImgId: Orm.INTEGER,
      grubEfiId: Orm.INTEGER,
      ldLinuxId: Orm.INTEGER,
      isolinuxBinId: Orm.INTEGER,
      isohdpfxBinId: Orm.INTEGER,
      isoId: Orm.INTEGER
    }
  },
  settings: {
    entityValidator: {
      script: "string",
      label: "string",
      ipxeUefiId: "number",
      ipxeBiosId: "number",
      grubImgId: "number",
      grubEfiId: "number",
      ldLinuxId: "number",
      isolinuxBinId: "number",
      isohdpfxBinId: "number",
      isoId: "number"
    }
  }
};
