import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Utils } from '../app.utils';
import { MetaTag } from '../classes/MetaTag';

@Injectable({
    providedIn: 'root'
})
export class MetaTagService {

    private title = "title";
    private description = "description";
    private ogUrlMeta: string = "og:url";
    private ogTitleMeta: string = "og:title";
    private ogTypeMetag: string = "og:type";
    private ogDescriptionMeta: string = "og:description";
    private imageMeta: string = "og:image";
    private secureImageMeta: string = "og:image:secure_url";
    private twitterTitleMeta: string = "twitter:title";
    private twitterSiteMeta: string = "twitter:site";
    private twitterCardMeta: string = "twitter:card";
    private twitterDescMeta: string = "twitter:description";
    private twitterCreatorMeta: string = "twitter:creator";
    private twitterImageMeta: string = "twitter:image";

    private imageWidth: string = "og:image:width ";
    private imageHeight: string = "og:image:height";

    constructor(private titleService: Title, private metaService: Meta) { }

    public setTitle(title: string): void {
        this.titleService.setTitle(title);
    }

    public setSocialMediaTags(
        ogUrl: string,
        title: string,
        description: string,
        imageUrl: string,
        width: string = null,
        height: string = null,
        ogType: string = 'website',
        twitSite: string = '@shopbyzmo',
        twitCard: string = 'summary',
        twitCreator: string = '@shopbyzmo'): void {
        var tags = [
            new MetaTag(this.ogUrlMeta, ogUrl, true),
            new MetaTag(this.ogTitleMeta, title, true),
            new MetaTag(this.ogTypeMetag, ogType, true),
            // new MetaTag(this.descriptionMeta, description, true),
            // new MetaTag(this.imageMeta, imageUrl, true),
            // new MetaTag(this.secureImageMeta, imageUrl, true),
            new MetaTag(this.title, title, false),
            new MetaTag(this.description, description, false),
            new MetaTag(this.twitterTitleMeta, title, false),
            new MetaTag(this.twitterSiteMeta, twitSite, false),
            new MetaTag(this.twitterCardMeta, twitCard, false),
            new MetaTag(this.twitterDescMeta, description, false),
            new MetaTag(this.twitterCreatorMeta, twitCreator, false),
            new MetaTag(this.twitterImageMeta, imageUrl, false),
        ];

        if (!Utils.isNullOrUndefined(imageUrl)) {
            tags.push(new MetaTag(this.imageMeta, imageUrl, true))
            tags.push(new MetaTag(this.secureImageMeta, imageUrl, true))
        } else {
            var img = this.metaService.getTag(`property='${this.imageMeta}'`)
            if (!Utils.isNullOrUndefined(img))
                this.metaService.removeTag(`property='${this.imageMeta}'`)

            var sImg = this.metaService.getTag(`property='${this.secureImageMeta}'`)
            if (!Utils.isNullOrUndefined(sImg))
                this.metaService.removeTag(`property='${this.secureImageMeta}'`)
        }
        if (!Utils.isNullOrUndefined(description))
            tags.push(new MetaTag(this.ogDescriptionMeta, description, true))
        else {
            var desc = this.metaService.getTag(`property='${this.ogDescriptionMeta}'`)
            if (!Utils.isNullOrUndefined(desc))
                this.metaService.removeTag(`property='${this.ogDescriptionMeta}'`)
        }

        if (!Utils.isNullOrUndefined(height))
            tags.push(new MetaTag(this.imageHeight, height, true))
        else {
            var desc = this.metaService.getTag(`property='${this.imageHeight}'`)
            if (!Utils.isNullOrUndefined(desc))
                this.metaService.removeTag(`property='${this.imageHeight}'`)
        }
        if (!Utils.isNullOrUndefined(width))
            tags.push(new MetaTag(this.imageWidth, width, true))
        else {
            var desc = this.metaService.getTag(`property='${this.imageWidth}'`)
            if (!Utils.isNullOrUndefined(desc))
                this.metaService.removeTag(`property='${this.imageWidth}'`)
        }


        this.setTags(tags);
    }

    private setTags(tags: MetaTag[]): void {
        tags.forEach(siteTag => {
            const tag = siteTag.isFacebook ? this.metaService.getTag(`property='${siteTag.name}'`) : this.metaService.getTag(`name='${siteTag.name}'`);
            if (siteTag.isFacebook) {
                this.metaService.updateTag({ property: siteTag.name, content: siteTag.value });
            } else {
                this.metaService.updateTag({ name: siteTag.name, content: siteTag.value });
            }
        });
    }
}